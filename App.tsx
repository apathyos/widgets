import app from 'ags/gtk4/app';
import css from './style.scss';
import { TopBarModule, StatusPanelModule, NotificationLayerModule, FloatingLayerModule } from './modules';
import { APP_ID } from './lib/constants/os';
import { WindowService } from './lib/services/WindowService';
import { WindowRegistry } from './lib/registry/WindowRegistry';
import { WindowSystemContext } from './lib/contexts/windowing/WindowSystemContext';
import { AuthService } from './lib/services/AuthService';
import { AuthPromptContext } from './lib/contexts/system';
import { PolkitAuthAgent } from '@/models/Auth/PolkitAuthAgent';

function main(this: typeof app) {
    const polkitAgent = new PolkitAuthAgent();
    const windowService = new WindowService(new WindowRegistry());
    const authService = new AuthService(polkitAgent, windowService);
    authService.register();

    this.connect('shutdown', () => {
        authService.unregister();
    });

    WindowSystemContext.provide({ service: windowService }, () => {
        AuthPromptContext.provide({ service: authService }, () => {
            <TopBarModule />;
            <StatusPanelModule />;
            <NotificationLayerModule />;
            <FloatingLayerModule />;
        });
    });
}

app.start({
    css,
    instanceName: APP_ID,
    requestHandler: () => {},
    main,
});
