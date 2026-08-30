import cn from 'classnames';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { INotification } from '../../types/notification';
import { createState, onCleanup } from 'gnim';
import { Gtk } from 'ags/gtk4';
import { Group } from '@/shared';
import { withPinned } from '@/shared/List/hocs/withPinned';
import { NotificationRevealerListItem } from '../NotificationRevealerListItem';
import { BaseListAdapter } from '@/shared/List/adapters';
import { ListBase } from '@/shared/base/ListBase';
import { Transition } from '@/types/common';

export interface INotificationGroup {
    title: PropertyValue<string>;
    notifications: PropertyValue<INotification[]>;
    isExpanded?: PropertyValue<boolean>;
    isClosable?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'expand' | 'close' | 'title' | 'notification'>;
    onExpand?: (isExpanded: boolean) => void;
    onClose?: () => void;
}

const PinnedList = withPinned(BaseListAdapter(ListBase));

export function NotificationGroup(props: INotificationGroup) {
    const { title, notifications, isClosable = true, classes, onExpand, onClose } = props;

    const [isExpanded, setIsExpanded] = createState(unpackAccessor(props.isExpanded) ?? false);

    const pinnedNotifications = toAccessor(notifications)(v => v[0] ? [String(v[0].id)] : []);

    let listRef: Gtk.ScrolledWindow | null = null;
    const expandingTransitionDuration = Transition.FASTER;

    const isExpandSub = toAccessor(props.isExpanded).subscribe(() => {
        const expanded = unpackAccessor(props.isExpanded);
        typeof expanded === 'boolean' && setIsExpanded(expanded);
    });

    onCleanup(() => {
        isExpandSub();
    });

    return (
        <Group
            title={title}
            isClosable={isClosable}
            isExpanded={isExpanded}
            onExpand={isExpanded => {
                setIsExpanded(isExpanded);
                onExpand?.(isExpanded);
            }}
            onClose={() => {
                unpackAccessor(notifications).forEach(n => n.dismiss());
                onClose?.();
            }}
            onHeaderClick={() => listRef?.get_vadjustment().set_value(0)}
            classes={{
                root: updateAccessor(
                    classes?.root,
                    (root, get) => cn(root, 'notification-group', get(isExpanded) && 'notification-group_expanded')
                )
            }}
        >
            <PinnedList
                ref={self => (listRef = self)}
                classes={{
                    root: 'notification-group-content-list',
                    scrollContainer: 'notification-group-content-list__scroller'
                }}
                isRevealed={isExpanded}
                values={toAccessor(notifications)(v => v.map(n => String(n.id)))}
                pinned={pinnedNotifications}
                scroller={{
                    maxContentHeight: 500
                }}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                transitionDuration={expandingTransitionDuration}
                getItem={value => {
                    const notification = unpackAccessor(notifications).find(n => String(n.id) === value);

                    if (!notification) {
                        return <box />;
                    }

                    return (
                        <NotificationRevealerListItem
                            notification={notification}
                            isExpanded={isExpanded}
                            expandingTransitionType={Gtk.StackTransitionType.CROSSFADE}
                            expandingTransitionDuration={expandingTransitionDuration}
                            classes={{
                                notification: updateAccessor(classes?.notification, notification => cn(
                                    notification,
                                    'notification-group__notification'
                                ))
                            }}
                            onClose={handleClose => handleClose(unpackAccessor(notifications).length > 1)}
                        />
                    );
                }}
            />
        </Group>
    );
}
