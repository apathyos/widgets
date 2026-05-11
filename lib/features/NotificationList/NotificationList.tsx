import { createComputed, createState, For } from 'gnim';
import { Notification } from '../../models/Notification';
import { NotificationGroup } from '../../shared';
import Notifd from 'gi://AstalNotifd?version=0.1';
import { Gtk } from 'ags/gtk4';
import { SPACING_L } from '../../constants/widget';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { Classes } from '../../types/utils';
import { INotification } from '../../types/notification';

const NotificationService = Notifd.get_default();

export interface INotificationList {
    classes?: Classes<'root'>;
}

export function NotificationList(props: INotificationList) {
    const { classes } = props;

    const notification = new Notification(NotificationService);

    const [notifications, setNotifications] = createState(notification.getNotifications());
    const [expandedGroups, setExpandedGroups] = createState<Record<string, boolean>>({});

    const notificationsGroups = createComputed(get => get(notifications).reduce((acc, notif) => {
        let groupIdx = acc.findIndex(group => group[0]?.appName === notif.appName);

        if (groupIdx < 0) {
            acc.push([]);
            groupIdx = acc.length - 1;
        }

        acc[groupIdx].push(notif);

        return acc;
    }, [] as INotification[][]));

    NotificationService.connect('notify', () => {
        setNotifications(notification.getNotifications());
    });

    return (
        <scrolledwindow hexpand vexpand>
            <box
                class={updateAccessor(
                    classes?.root,
                    (root, get) => cn(root, 'notification-list', !get(notifications).length && 'notification-list_empty')
                )}
                orientation={Gtk.Orientation.VERTICAL}
                spacing={SPACING_L}
            >
                <For each={notificationsGroups}>
                    {(group) => (
                        <NotificationGroup
                            title={group[0]?.appName}
                            notifications={group}
                            isExpanded={unpackAccessor(expandedGroups)[group[0]?.appName]}
                            onExpand={isExpanded => setExpandedGroups({
                                ...unpackAccessor(expandedGroups),
                                [group[0]?.appName]: isExpanded
                            })}
                        />
                    )}
                </For>
            </box>
        </scrolledwindow>
    );
}
