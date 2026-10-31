import { WindowService } from '../WindowService';
import { PolkitAuthAgent } from '@/models/Auth';
import { NetworkManagerSecretAgent } from '@/models/Auth/NetworkManagerSecretAgent';
import { PolkitAuthService } from './PolkitAuthService';
import { NMSecretAgentService } from './NMSecretAgentService';
import Network from 'gi://AstalNetwork?version=0.1';

const NetworkService = Network.get_default();

export class AuthService {
    polkitService: PolkitAuthService;
    nmService: NMSecretAgentService;

    constructor(windowService: WindowService) {
        this.polkitService = new PolkitAuthService(windowService, new PolkitAuthAgent());
        this.nmService = new NMSecretAgentService(windowService, new NetworkManagerSecretAgent(NetworkService));
    }

    async register() {
        await this.polkitService.register();
        await this.nmService.register();
    }

    async unregister() {
        await this.polkitService.unregister();
        await this.nmService.unregister();
    }
}
