import { PolkitAuthAgentSignal, PolkitAuthCommand } from '@/models/types/auth';
import { PolkitAuthAgent } from '@/models/Auth';
import { WindowService } from '../WindowService';
import { PolkitAuthInputModalController } from '@/controllers/Auth';
import { InputModalCommand } from '@/models/Modal/types/windowing';
import { AuthServiceBase } from './AuthServiceBase';

export class PolkitAuthService extends AuthServiceBase {
    private signal: PolkitAuthAgentSignal = () => null;

    constructor(
        windowService: WindowService,
        private readonly polkitAgent: PolkitAuthAgent
    ) {
        super(windowService);
    }

    async register(): Promise<void> {
        this.signal = ({ type }) => type === PolkitAuthCommand.START_SESSION && this.promptAuth();
        this.polkitAgent.signal(this.signal);

        await this.polkitAgent.register();
    }

    async unregister(): Promise<void> {
        await this.polkitAgent.unregister();
    }

    private promptAuth() {
        const proxy = this.openAuthModal(context => new PolkitAuthInputModalController(context, this.polkitAgent));

        this.polkitAgent.signal((command) => {
            if (command.type === PolkitAuthCommand.SHOW_INFO) {
                proxy.send({ type: InputModalCommand.SET_INFO, payload: { value: command.message } });
            }

            if (command.type === PolkitAuthCommand.SHOW_ERROR) {
                proxy.send({ type: InputModalCommand.SET_ERROR, payload: { value: command.message } });
            }
        });

        proxy.done.then(() => this.polkitAgent.stop());
    }
}
