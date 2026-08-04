import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import PolkitAgent from 'gi://PolkitAgent';
import { AuthAgentCommand, AuthAgentSignal, AuthCommand } from '../types/auth';
import { Dispose, Reject, Resolve } from '@/types/common';
import { CANCELLED_ERROR, FAILED_ERROR } from '@/constants/auth';
import { AuthError } from '@/errors';
import { choosePolkitIdentity } from '@/utils/auth';
import { ActiveAuthRequest, AuthAgentSessionSignal, BeginAuthParameters } from '@/types/auth';
import { getMessageFromError } from '@/utils/error';

export class PolkitAuthAgent {
    private active: ActiveAuthRequest | null = null;
    private session: PolkitAgent.Session | null = null;
    private signals: AuthAgentSignal[] = [];
    private requestResolve: Resolve | null = null;
    private requestReject: Reject | null = null;

    BeginAuthenticationAsync(
        parameters: BeginAuthParameters,
        invocation: Gio.DBusMethodInvocation,
        _fdList: Gio.UnixFDList | null,
    ) {
        if (this.active) {
            invocation.return_dbus_error(FAILED_ERROR, 'Another authentication request is active');
            return;
        }

        try {
            const [actionId, message, _iconName, _details, cookie, identities] = parameters;

            const identity = choosePolkitIdentity(identities);
            this.active = { actionId, message, cookie, identity, invocation };

            this.emitCommand({ type: AuthCommand.START_SESSION });
            this.startSession();
        } catch (error) {
            invocation.return_dbus_error(FAILED_ERROR, getMessageFromError(error));
            this.reset();
        }
    }

    CancelAuthentication(cookie: string) {
        if (this.active?.cookie !== cookie) {
            return;
        }

        this.cancel('Authentication was cancelled by Polkit');
    }

    signal(cb: AuthAgentSignal): Dispose {
        this.signals.push(cb);

        return () => {
            this.signals = this.signals.filter(signal => signal !== cb);
        };
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

        session.connect(AuthAgentSessionSignal.SHOW_INFO, (_session, message: string) => {
            if (this.session !== session) {
                return;
            }

            this.emitCommand({ type: AuthCommand.SHOW_INFO, message });
        });

        session.connect(AuthAgentSessionSignal.SHOW_ERROR, (_session, message: string) => {
            if (this.session !== session) {
                return;
            }

            this.emitCommand({ type: AuthCommand.SHOW_ERROR, message });
        });

        session.connect(AuthAgentSessionSignal.COMPLETED, (_session, authorized: boolean) => {
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

        this.reset();
    }

    private cancel(message: string) {
        if (!this.active) {
            return;
        }

        const request = this.active;
        const session = this.session;

        this.session = null;
        session?.cancel();

        request?.invocation.return_dbus_error(CANCELLED_ERROR, message);
        this.reset();
    }

    private reset() {
        this.session = null;
        this.active = null;
        this.requestResolve = null;
        this.requestReject = null;
    }

    private emitCommand(command: AuthAgentCommand) {
        this.signals.forEach(cb => cb(command));
    }
}
