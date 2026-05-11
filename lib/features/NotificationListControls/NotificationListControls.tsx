import { createState, With } from 'gnim';
import { Notification } from '../../models/Notification';
import { DotsSpinner, SymbolButton } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import Notifd from 'gi://AstalNotifd?version=0.1';
import { Size } from '../../types/common';

const NotificationService = Notifd.get_default();

export interface INotificationListControls {
    classes?: Classes<'root' | 'button'>;
}

export function NotificationListControls(props: INotificationListControls) {
    const { classes } = props;

    const notification = new Notification(NotificationService);

    const [notifications, setNotifications] = createState(notification.getNotifications());
    const [isDeleting, setIsDeleting] = createState(false);

    NotificationService.connect('notify', () => {
        setNotifications(notification.getNotifications());
    });

    return (
        <box class={updateAccessor(classes?.root, (root) => cn(root, 'notifications-list-controls'))}>
            <With value={notifications}>
                {(notifs) => (
                    <box>
                        <With value={isDeleting}>
                            {(isDeleting) => (
                                isDeleting ? (
                                    <DotsSpinner size={Size.XS} />
                                ) : notifs.length ? (
                                    <SymbolButton
                                        onClick={async () => {
                                            setIsDeleting(true);
                                            await notification.dismissAllNotifications();
                                            setIsDeleting(false);
                                        }}
                                        classes={{
                                            root: updateAccessor(
                                                classes?.button,
                                                (button) => cn(button, 'notifications-list-controls__button')
                                            )
                                        }}
                                    >
                                        <label label="󰎟" />
                                    </SymbolButton>
                                ) : null
                            )}
                        </With>
                    </box>
                )}
            </With>
        </box>
    );
}
