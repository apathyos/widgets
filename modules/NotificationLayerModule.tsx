import app from 'ags/gtk4/app';
import css from '../style.scss';
import { NotificationLayer } from '../lib/components';
import { WindowId } from '../lib/types/window';

const main = () => {
    try {
        <NotificationLayer />;
    } catch {
        console.error(`${WindowId.NOTIFICATION_LAYER} has suddenly crashed! Restarting.`)
        main();
    }
};

app.start({
    css,
    instanceName: WindowId.NOTIFICATION_LAYER,
    requestHandler: () => {},
    main,
});
