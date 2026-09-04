import { createComputed, createState, For, onCleanup } from 'gnim';
import { Notification } from '@/models/Notification';
import { NotificationGroup } from '../';
import Notifd from 'gi://AstalNotifd?version=0.1';
import { Gtk } from 'ags/gtk4';
import { stableAccessor, toAccessor, unpackAccessor, updateAccessor } from '@/utils/misc';
import cn from 'classnames';
import { Classes } from '@/types/utils';
import { INotification } from '@/types/notification';
import { Spacing } from '@/types/common';

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

    const groupsIdx = stableAccessor(notificationsGroups, { compose: groups => groups.map((_, idx) => idx) });

    const notifySub = NotificationService.connect('notify', () => {
        setNotifications(notification.getNotifications());
    });

    onCleanup(() => {
        NotificationService.disconnect(notifySub);
    });

    return (
        <Gtk.ScrolledWindow
            hexpand
            vexpand
            propagateNaturalHeight={false}
            hscrollbarPolicy={Gtk.PolicyType.NEVER}
        >
            <Gtk.Viewport
                hscrollPolicy={Gtk.ScrollablePolicy.MINIMUM}
                vscrollPolicy={Gtk.ScrollablePolicy.NATURAL}
            >
                <box
                    class={updateAccessor(
                        classes?.root,
                        (root, get) => cn(root, 'notification-list', !get(notifications).length && 'notification-list_empty')
                    )}
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={Spacing.L}
                >
                    <For each={toAccessor(groupsIdx)}>
                        {(idx: number) => {
                            const group = notificationsGroups(v => v[idx]);
                            const appName = group(v => v[0]?.appName);

                            return (
                                <NotificationGroup
                                    title={appName}
                                    notifications={group}
                                    isExpanded={createComputed(get => get(expandedGroups)[get(appName)] ?? false)}
                                    onExpand={isExpanded => setExpandedGroups({
                                        ...unpackAccessor(expandedGroups),
                                        [unpackAccessor(appName)]: isExpanded
                                    })}
                                    onClose={() => setExpandedGroups({
                                        ...unpackAccessor(expandedGroups),
                                        [unpackAccessor(appName)]: false
                                    })}
                                />
                            );
                        }}
                    </For>
                </box>
            </Gtk.Viewport>
        </Gtk.ScrolledWindow>
    );
}
