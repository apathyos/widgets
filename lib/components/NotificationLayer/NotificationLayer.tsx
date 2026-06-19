import app from 'ags/gtk4/app';
import Notifd from 'gi://AstalNotifd?version=0.1';
import { createComputed, createState, With } from 'gnim';
import { NotificationToast } from '../../shared';
import { Astal } from 'ags/gtk4';
import { NotificationToastVariant } from '../../shared/NotificationToast/types';
import { timeout, Timer } from 'ags/time';
import { DELAY_XL } from '../../constants/timer';
import { IdleStatus } from '../../types/system';
import { handleRequest } from '../../rpc/utils';
import {
    getIsDontDisturbCommandRequest,
    getIsDontDisturbQueryRequest,
    getIsIdleStatusCommandRequest,
    getDontDisturbQueryResponse,
    getDontDisturbCommandResponse,
    getIsDismissAllNotificationsCommandRequest
} from '../../rpc';
import { insertToArray, unpackAccessor, updateAccessor } from '../../utils/misc';
import { INotification, NotificationCategory } from '../../types/notification';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { Position } from '../../types/common';

const NotificationService = Notifd.get_default();

export interface INotificationLayer {
    classes?: Classes<'root'>;
}

export function NotificationLayer(props: INotificationLayer) {
    const { classes } = props;

    let notificationRef: Astal.Window | null = null;
    let timerRef: Timer | null = null;
    let shouldPop = false;

    let notificationsQueue: INotification[] = [];
    const [activeNotification, setActiveNotification] = createState<INotification | null>(null);
    const [idleStatus, setIdleStatus] = createState(IdleStatus.ACTIVE);
    const [dontDisturb, setDontDisturb] = createState(false);
    const [isHovered, setIsHovered] = createState(false);

    const canShowNotification = createComputed(get => !get(dontDisturb));

    const notificationVariant = createComputed(get => {
        const category = get(activeNotification)?.category;

        if (category === NotificationCategory.OSD) {
            return NotificationToastVariant.OSD;
        }

        return NotificationToastVariant.APP;
    });

    const popNotification = (delay = DELAY_XL) => {
        if (!shouldPop || unpackAccessor(isHovered)) {
            return;
        }

        timerRef?.cancel();
        timerRef = timeout(delay, () => {
            shouldPop = false;
            notificationRef?.destroy();
            setActiveNotification(notificationsQueue.shift() ?? null);

            if (unpackAccessor(idleStatus) === IdleStatus.ACTIVE) {
                shouldPop = true;
                popNotification();
            }
        });
    };

    NotificationService.connect('notified', (service, id) => {
        const activeNotif = unpackAccessor(activeNotification);
        const newNotification = service.get_notification(id);

        if (!newNotification) {
            return;
        }

        let shouldDisplay = false;

        if (newNotification.urgency === Notifd.Urgency.CRITICAL) {
            shouldDisplay = activeNotif?.urgency !== Notifd.Urgency.CRITICAL;

            const lastCritNotifIdx = notificationsQueue.findIndex(n => n.urgency === Notifd.Urgency.CRITICAL);

            if (lastCritNotifIdx >= 0) {
                notificationsQueue = insertToArray(notificationsQueue, newNotification, Position.AFTER, lastCritNotifIdx);
            } else {
                if (activeNotif && activeNotif.urgency !== Notifd.Urgency.CRITICAL) {
                    notificationsQueue.unshift(newNotification, activeNotif);
                } else {
                    notificationsQueue.unshift(newNotification);
                }
            }
        } else {
            notificationsQueue.push(newNotification);
        }

        if (!activeNotif || newNotification.category === NotificationCategory.OSD) {
            shouldDisplay = true;
        }

        if (shouldDisplay) {
            shouldPop = true;
            popNotification(0);
        }
    });

    app.connect('request', handleRequest(getIsIdleStatusCommandRequest, async (request) => {
        setIdleStatus(request.system.idleStatus);
    }));

    app.connect('request', handleRequest(getIsDontDisturbCommandRequest, async (request) => {
        setDontDisturb(request.notifications.dontDisturb);
    }, { respondWith: () => getDontDisturbCommandResponse(dontDisturb.get()) }));

    app.connect('request', handleRequest(getIsDontDisturbQueryRequest, () => undefined, {
        respondWith: () => getDontDisturbQueryResponse(dontDisturb.get())
    }));

    app.connect('request', handleRequest(getIsDismissAllNotificationsCommandRequest, () => {
        notificationsQueue = [];
        shouldPop = true;
        popNotification(0);
    }));

    idleStatus.subscribe(() => {
        const isActive = unpackAccessor(idleStatus) === IdleStatus.ACTIVE;

        if (isActive) {
            shouldPop = true;

            if (unpackAccessor(activeNotification)) {
                popNotification();
            }
        }
    });

    dontDisturb.subscribe(() => {
        if (unpackAccessor(dontDisturb)) {
            popNotification(0);
        }
    });

    return (
        <With value={activeNotification}>
            {activeNotification => activeNotification && unpackAccessor(canShowNotification) ? (
                <NotificationToast
                    ref={self => (notificationRef = self)}
                    variant={unpackAccessor(notificationVariant)}
                    title={activeNotification.appName}
                    summary={activeNotification.summary}
                    body={activeNotification.body}
                    isExpanded={isHovered}
                    classes={{
                        root: updateAccessor(classes?.root, root => cn(root, 'notification-layer-notification-toast'))
                    }}
                    onClose={() => {
                        setIsHovered(false);
                        popNotification(0);
                    }}
                    onMouseEnter={() => {
                        setIsHovered(true);
                        timerRef?.cancel();
                    }}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        popNotification();
                    }}
                />
            ) : null}
        </With>
    );
}
