import { NMSecretAgentCommand, NMSecretAgentSignal } from '@/models/types/auth';
import { WindowService } from '../WindowService';
import { NetworkManagerSecretAgentInputModalController } from '@/controllers/Auth';
import { InputModalCommand } from '@/models/Modal/types/windowing';
import { NetworkManagerSecretAgent } from '@/models/Auth/NetworkManagerSecretAgent';
import { AuthServiceBase } from './AuthServiceBase';
import { NMSecretAgentSessionRequest } from '@/types/auth';

export class NMSecretAgentService extends AuthServiceBase {
    private signal: NMSecretAgentSignal = () => null;

    constructor(
        windowService: WindowService,
        private readonly nmSecretAgent: NetworkManagerSecretAgent
    ) {
        super(windowService);
    }

    async register(): Promise<void> {
        this.signal = (command) => command.type === NMSecretAgentCommand.START_SESSION && this.promptAuth({
            request: command.request
        });
        this.nmSecretAgent.signal(this.signal);

        await this.nmSecretAgent.register();
    }

    async unregister(): Promise<void> {
        await this.nmSecretAgent.unregister();
    }

    private promptAuth(args: { request: NMSecretAgentSessionRequest }) {
        const { request } = args;

        const proxy = this.openAuthModal(
            context => new NetworkManagerSecretAgentInputModalController(context, this.nmSecretAgent, request)
        );

        this.nmSecretAgent.signal((command) => {
            if (command.type === NMSecretAgentCommand.SHOW_INFO) {
                proxy.send({ type: InputModalCommand.SET_INFO, payload: { value: command.message } });
            }

            if (command.type === NMSecretAgentCommand.SHOW_ERROR) {
                proxy.send({ type: InputModalCommand.SET_ERROR, payload: { value: command.message } });
            }

            if (command.type === NMSecretAgentCommand.CLOSE && command.requestId === request.id) {
                proxy.close();
            }
        });

        proxy.done.then(() => this.nmSecretAgent.stop({ id: request.id }));
    }
}
