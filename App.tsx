import app from 'ags/gtk4/app';
import css from './style.scss';
import { TopBarModule, StatusPanelModule, NotificationLayerModule } from './modules';
import { APP_ID } from './lib/constants/os';

const main = () => {
    <TopBarModule />;
    <StatusPanelModule />;
    <NotificationLayerModule />;
};

app.start({
    css,
    instanceName: APP_ID,
    requestHandler: () => {},
    main,
});
