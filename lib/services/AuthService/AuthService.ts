import { InputType } from '../../types/input';
import { WindowType } from '../../types/windowing';
import { WindowService } from '../WindowService';
import { PolkitAuthAgent } from '@/models/Auth';
import { AuthInputModalController } from '@/controllers/Auth';
import { AuthAgentSignal, AuthCommand } from '@/models/types/auth';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { AGENT_PATH, AGENT_XML, AUTHORITY_INTERFACE, AUTHORITY_NAME, AUTHORITY_PATH } from '@/constants/auth';
import { getSystemLocale, getXDGSessionId } from '@/utils/system';
import {
    AuthBusMethod,
    AuthBusMethodSignature,
    PolkitIdentity,
    PolkitIdentityDetailsEntry,
    PolkitIdentityKind
} from '@/types/auth';
import { InputModalCommand } from '@/models/Modal/types/windowing';

export class AuthService {
    signal: AuthAgentSignal;

    private readonly bus = Gio.DBus.system;
    private exportedObject: Gio.DBusExportedObject | null = null;
    private subject: PolkitIdentity | null = null;

    constructor(
        private readonly polkitAgent: PolkitAuthAgent,
        private readonly windowService: WindowService
    ) {
        this.signal = ({ type }) => type === AuthCommand.START_SESSION && this.promptAuth();

        polkitAgent.signal(this.signal);
    }

    register() {
        if (this.exportedObject) {
            throw new Error('Polkit agent is already registered');
        }

        const sessionId = getXDGSessionId();

        this.subject = [PolkitIdentityKind.UNIX_SESSION, {
            [PolkitIdentityDetailsEntry.SESSION_ID]: new GLib.Variant('s', sessionId)
        }];
        this.exportedObject = Gio.DBusExportedObject.wrapJSObject(AGENT_XML, this.polkitAgent);
        this.exportedObject.export(this.bus, AGENT_PATH);

        try {
            this.callRegisterAuthAgentBusMethod();
        } catch (error) {
            this.reset();
            throw error;
        }
    }

    unregister() {
        this.polkitAgent.stop();

        try {
            this.callUnregisterAuthAgentBusMethod();
        } catch (error) {
            console.error('Could not unregister Polkit agent:', error);
        }

        this.reset();
    }


    protected promptAuth() {
        const proxy = this.windowService.open(
            {
                type: WindowType.INPUT_MODAL,
                title: 'Authenticate',
                props: {
                    type: InputType.PASSWORD,
                    focused: true
                }
            },
            context => new AuthInputModalController(context, this.polkitAgent)
        );

        this.polkitAgent.signal((command) => {
            if (command.type === AuthCommand.SHOW_INFO) {
                proxy.send({ type: InputModalCommand.SET_INFO, payload: { value: command.message } });
            }

            if (command.type === AuthCommand.SHOW_ERROR) {
                proxy.send({ type: InputModalCommand.SET_ERROR, payload: { value: command.message } });
            }
        });

        proxy.done.then(() => this.polkitAgent.stop());
    }

    private callRegisterAuthAgentBusMethod() {
        if (!this.subject) {
            throw new Error('No subject for the agent');
        }

        const locale = getSystemLocale();

        this.callAgentBusMethod({
            method: AuthBusMethod.RegisterAuthenticationAgent,
            parameters: new GLib.Variant(AuthBusMethodSignature.RegisterAuthenticationAgent, [
                this.subject,
                locale,
                AGENT_PATH,
            ]),
        });
    }

    private callUnregisterAuthAgentBusMethod() {
        if (!this.subject) {
            throw new Error('No subject for the agent');
        }

        this.callAgentBusMethod({
            method: AuthBusMethod.UnregisterAuthenticationAgent,
            parameters: new GLib.Variant(AuthBusMethodSignature.UnregisterAuthenticationAgent, [
                this.subject,
                AGENT_PATH
            ]),
        });
    }

    private callAgentBusMethod(args: {
        method: string;
        parameters: GLib.Variant;
    }) {
        const { method, parameters } = args;

        this.bus.call_sync(
            AUTHORITY_NAME,
            AUTHORITY_PATH,
            AUTHORITY_INTERFACE,
            method,
            parameters,
            null,
            Gio.DBusCallFlags.NONE,
            -1,
            null,
        );
    }

    private reset() {
        this.exportedObject?.unexport();
        this.exportedObject = null;
        this.subject = null;
    }
}
