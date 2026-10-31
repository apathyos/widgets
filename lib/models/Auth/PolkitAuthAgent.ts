import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import PolkitAgent from 'gi://PolkitAgent';
import { PolkitAgentCommand, PolkitAuthAgentSignal, PolkitAuthCommand } from '../types/auth';
import { Dispose, Reject, Resolve } from '@/types/common';
import {
    POLKIT_AGENT_PATH,
    POLKIT_AUTHORITY_INTERFACE,
    POLKIT_AUTHORITY_NAME,
    POLKIT_AUTHORITY_PATH,
    POLKIT_CANCELLED_ERROR,
    POLKIT_FAILED_ERROR
} from '@/constants/auth';
import { AuthError } from '@/errors';
import { choosePolkitIdentity } from '@/utils/auth';
import {
    PolkitActiveAuthRequest,
    PolkitAgentBusMethod,
    PolkitAgentBusMethodSignature,
    PolkitAgentSessionSignal,
    PolkitAgentSignatureByMethod,
    PolkitBeginAuthParameters,
    PolkitIdentity,
    PolkitIdentityDetailsEntry,
    PolkitIdentityKind
} from '@/types/auth';
import { getMessageFromError } from '@/utils/error';
import { Bus } from '../base/Bus';
import { getSystemLocale, getXDGSessionId } from '@/utils/system';
import { POLKIT_AGENT_XML } from '@/config/dbus/auth';
import { SignalRegistry } from '@/registry/SignalRegistry';
import { AuthAgent } from '../base/AuthAgent';

export class PolkitAuthAgent extends AuthAgent {
    private readonly bus: Bus<PolkitAgentSignatureByMethod>;
    private readonly signalRegistry: SignalRegistry<PolkitAgentCommand>;

    private exportedObject: Gio.DBusExportedObject | null = null;
    private subject: PolkitIdentity | null = null;

    private active: PolkitActiveAuthRequest | null = null;
    private session: PolkitAgent.Session | null = null;
    private requestResolve: Resolve | null = null;
    private requestReject: Reject | null = null;

    constructor() {
        super();

        this.bus = new Bus(
            Gio.DBus.system,
            POLKIT_AUTHORITY_NAME,
            POLKIT_AUTHORITY_PATH,
            POLKIT_AUTHORITY_INTERFACE,
        );

        this.signalRegistry = new SignalRegistry();
    }

    async register() {
        if (this.exportedObject) {
            throw new Error('Polkit agent is already registered');
        }

        const sessionId = getXDGSessionId();

        this.subject = [PolkitIdentityKind.UNIX_SESSION, {
            [PolkitIdentityDetailsEntry.SESSION_ID]: new GLib.Variant('s', sessionId)
        }];
        this.exportedObject = Gio.DBusExportedObject.wrapJSObject(POLKIT_AGENT_XML, this);
        this.exportedObject.export(this.bus.connection, POLKIT_AGENT_PATH);

        try {
            this.callRegisterAuthAgentBusMethod();
        } catch (error) {
            this.resetSession();
            throw error;
        }
    }

    async unregister() {
        this.stop();

        try {
            this.callUnregisterAuthAgentBusMethod();
        } catch (error) {
            console.error('Could not unregister Polkit agent:', error);
        }

        this.resetAgent();
    }

    BeginAuthenticationAsync(
        parameters: PolkitBeginAuthParameters,
        invocation: Gio.DBusMethodInvocation,
        _fdList: Gio.UnixFDList | null,
    ) {
        if (this.active) {
            invocation.return_dbus_error(POLKIT_FAILED_ERROR, 'Another authentication request is active');
            return;
        }

        try {
            const [actionId, message, _iconName, _details, cookie, identities] = parameters;

            const identity = choosePolkitIdentity(identities);
            this.active = { actionId, message, cookie, identity, invocation };

            this.emitCommand({ type: PolkitAuthCommand.START_SESSION });
            this.startSession();
        } catch (error) {
            invocation.return_dbus_error(POLKIT_FAILED_ERROR, getMessageFromError(error));
            this.resetSession();
        }
    }

    CancelAuthentication(cookie: string) {
        if (this.active?.cookie !== cookie) {
            return;
        }

        this.cancel('Authentication was cancelled by Polkit');
    }

    signal(cb: PolkitAuthAgentSignal): Dispose {
        return this.signalRegistry.register(cb);
    }

    respond(response: string) {
        if (!this.session) {
            return;
        }

        this.session.response(response);

        return new Promise((res, rej) => {
            this.requestResolve = res;
            this.requestReject = rej;
        });
    }

    stop() {
        this.cancel('Authentication agent stopped');
    }

    private startSession() {
        const request = this.active;

        if (!request) {
            return;
        }

        const session = new PolkitAgent.Session({
            identity: request.identity,
            cookie: request.cookie,
        });

        this.session = session;

        session.connect(PolkitAgentSessionSignal.SHOW_INFO, (_session, message: string) => {
            if (this.session !== session) {
                return;
            }

            this.emitCommand({ type: PolkitAuthCommand.SHOW_INFO, message });
        });

        session.connect(PolkitAgentSessionSignal.SHOW_ERROR, (_session, message: string) => {
            if (this.session !== session) {
                return;
            }

            this.emitCommand({ type: PolkitAuthCommand.SHOW_ERROR, message });
        });

        session.connect(PolkitAgentSessionSignal.COMPLETED, (_session, authorized: boolean) => {
            if (this.session !== session) {
                return;
            }

            this.session = null;

            if (authorized) {
                this.requestResolve?.();
                this.complete();
                return;
            }

            this.requestReject?.(new AuthError('Authentication failed'));
            this.startSession();
        });

        session.initiate();
    }

    private complete() {
        const request = this.active;

        if (!request) {
            return;
        }

        request.invocation.return_value(new GLib.Variant('()', []));

        this.resetSession();
    }

    private cancel(message: string) {
        if (!this.active) {
            return;
        }

        const request = this.active;
        const session = this.session;

        this.session = null;
        session?.cancel();

        request?.invocation.return_dbus_error(POLKIT_CANCELLED_ERROR, message);
        this.resetSession();
    }

    private resetSession() {
        this.session = null;
        this.active = null;
        this.requestResolve = null;
        this.requestReject = null;
    }

    private resetAgent() {
        this.exportedObject?.unexport();
        this.exportedObject = null;
        this.subject = null;
    }

    private emitCommand(command: PolkitAgentCommand) {
        this.signalRegistry.emit(command);
    }

    private callRegisterAuthAgentBusMethod() {
        if (!this.subject) {
            throw new Error('No subject for the agent');
        }

        const locale = getSystemLocale();

        this.bus.call({
            method: PolkitAgentBusMethod.RegisterAuthenticationAgent,
            parameters: new GLib.Variant(PolkitAgentBusMethodSignature.RegisterAuthenticationAgent, [
                this.subject,
                locale,
                POLKIT_AGENT_PATH,
            ])
        }, { sync: true });
    }

    private callUnregisterAuthAgentBusMethod() {
        if (!this.subject) {
            throw new Error('No subject for the agent');
        }

        this.bus.call({
            method: PolkitAgentBusMethod.UnregisterAuthenticationAgent,
            parameters: new GLib.Variant(PolkitAgentBusMethodSignature.UnregisterAuthenticationAgent, [
                this.subject,
                POLKIT_AGENT_PATH,
            ])
        }, { sync: true });
    }
}
