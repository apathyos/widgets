import { INotification } from '@/types/notification';
import { Notification, RevealerListItem } from '@/shared';
import { unpackAccessor, updateAccessor } from '@/utils/misc';
import cn from 'classnames';
import { Classes, PropertyValue } from '@/types/utils';
import { createBinding, createState } from 'gnim';
import { Spacing, Transition } from '@/types/common';
import { timeout } from 'ags/time';
import { Gtk } from 'ags/gtk4';

export interface INotificationRevealerListItem {
    notification: INotification;
    isExpanded: PropertyValue<boolean>;
    expandingTransitionType?: PropertyValue<Gtk.StackTransitionType>;
    expandingTransitionDuration?: PropertyValue<number>;
    closeTransitionDuration?: PropertyValue<number>;
    classes?: Classes<'notification'>;
    onClose?: (handleClose: (needTimeout: boolean) => void) => void;
}

export function NotificationRevealerListItem(props: INotificationRevealerListItem) {
    const {
        notification,
        isExpanded,
        expandingTransitionType,
        expandingTransitionDuration,
        closeTransitionDuration = Transition.FASTER,
        classes,
        onClose
    } = props;

    const [isBeingClosed, setIsBeingClosed] = createState(false);

    const summary = createBinding(notification, 'summary');
    const body = createBinding(notification, 'body');
    const time = createBinding(notification, 'time');

    const handleClose = (needTimeout: boolean) => {
        if (!needTimeout) {
            notification.dismiss();
            return;
        }

        setIsBeingClosed(true);
        timeout(unpackAccessor(closeTransitionDuration), () => notification.dismiss());
    };

    return (
        <RevealerListItem
            isRevealed={isBeingClosed(v => !v)}
            item={{
                name: summary,
                value: String(notification.id)
            }}
            spacing={Spacing.M}
            transitionDuration={closeTransitionDuration}
            classes={{ root: 'notification-revealer-list-item' }}
        >
            {() => (
                <Notification
                    summary={summary}
                    body={body}
                    time={time}
                    onClose={() => onClose?.(handleClose)}
                    closable={isExpanded}
                    isExpanded={isExpanded}
                    bodyTooltipText={updateAccessor(isExpanded, (isExpanded, get) => isExpanded ? get(body) : '')}
                    expandingTransitionType={expandingTransitionType}
                    expandingTransitionDuration={expandingTransitionDuration}
                    classes={{
                        root: updateAccessor(
                            classes?.notification,
                            notification => cn(notification, 'notification-revealer-list-item__notification')
                        )
                    }}
                />
            )}
        </RevealerListItem>
    );
}
