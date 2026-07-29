import { Accessor } from 'ags';
import { Astal } from 'ags/gtk4';
import { WindowService } from '../../services/WindowService';
import { INotification } from '../../types/notification';
import { unpackAccessor } from '../../utils/misc';
import { Dispose } from '../../types/common';
import { onCleanup } from 'gnim';
import { NotificationCommand } from '../../models/Notification/types/windowing';
import { WindowType } from '../../types/windowing';
import { Notification } from '../../models/Notification';
import { NotificationController } from '../../controllers/Notification';
import { NOTIFICATION_TOAST_X_POSITION, NOTIFICATION_TOAST_Y_POSITION } from '../../constants/widget';

export interface INotificationWindow {
    notification: Accessor<INotification | null>;
    windowService: WindowService;
    onClose?: () => void;
    onHover?: (isHovered: boolean) => void;
}

export function NotificationWindow(props: INotificationWindow) {
    const { notification, windowService, onClose, onHover } = props;

    let signalDispose: Dispose | null = null;

    notification.subscribe(() => {
        const notif = unpackAccessor(notification);

        if (!notif) {
            return;
        }

        const proxy = windowService.open({
            id: String(notif.id),
            type: WindowType.NOTIFICATION,
            options: {
                position: { x: NOTIFICATION_TOAST_X_POSITION, y: NOTIFICATION_TOAST_Y_POSITION },
                layer: Astal.Layer.OVERLAY,
                anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
                keymode: Astal.Keymode.NONE,
                noFrame: true
            },
            props: {
                variant: Notification.getNotificationVariant({ notification: notif }),
                title: notif.appName,
                summary: notif.summary,
                body: notif.body
            }
        }, (context) => new NotificationController(context));

        proxy.done.then(() => onClose?.());

        signalDispose = proxy.signal((command) => {
            if (command.type === NotificationCommand.HOVER) {
                onHover?.(command.payload.value);
            }
        });
    });

    onCleanup(() => signalDispose?.());

    return <></>;
}
