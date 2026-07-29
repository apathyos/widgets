import app from 'ags/gtk4/app';
import css from './style.scss';
import { TopBarModule, StatusPanelModule, NotificationLayerModule, FloatingLayerModule } from './modules';
import { APP_ID } from './lib/constants/os';
import { WindowService } from './lib/services/WindowService';
import { WindowRegistry } from './lib/registry/WindowRegistry';
import { WindowSystemContext } from './lib/contexts/windowing/WindowSystemContext';

const main = () => {
    const windowService = new WindowService(new WindowRegistry());

    WindowSystemContext.provide({ service: windowService }, () => {
        <TopBarModule />;
        <StatusPanelModule />;
        <NotificationLayerModule />;
        <FloatingLayerModule />;
    });
};

app.start({
    css,
    instanceName: APP_ID,
    requestHandler: () => {},
    main,
});
