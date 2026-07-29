import app from 'ags/gtk4/app';
import Notifd from 'gi://AstalNotifd?version=0.1';
import { createComputed, createState } from 'gnim';
import { timeout, Timer } from 'ags/time';
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
import { insertToArray, unpackAccessor } from '../../utils/misc';
import { INotification, NotificationCategory } from '../../types/notification';
import { Delay, Position } from '../../types/common';
import { useWindowSystem } from '../../contexts/windowing';
import { WindowType } from '../../types/windowing';
import { NotificationCommand } from '../../models/Notification/types/windowing';
import { onCleanup } from 'ags';
import { NotificationWindow } from '../../features';

const NotificationService = Notifd.get_default();

export function NotificationLayer() {
    const { service } = useWindowSystem();

    let notificationsQueue: INotification[] = [];
    const [activeNotification, setActiveNotification] = createState<INotification | null>(null);
    const [idleStatus, setIdleStatus] = createState(IdleStatus.ACTIVE);
    const [dontDisturb, setDontDisturb] = createState(false);
    const [isHovered, setIsHovered] = createState(false);

    let timerRef: Timer | null = null;
    let shouldPop = false;

    const canShowNotification = createComputed(get => !get(dontDisturb));

    const closeActiveNotification = () => {
        const notif = unpackAccessor(activeNotification);
        notif && service.send(String(notif.id), WindowType.NOTIFICATION, { type: NotificationCommand.CLOSE });
    };

    const updateNotification = (id: string, notification: INotification) => {
        const { appName: title, summary, body } = notification;

        service.send(id, WindowType.NOTIFICATION, {
            type: NotificationCommand.UPDATE,
            payload: { title, summary, body }
        });
    };

    const popNotification = (delay = Delay.XXL) => {
        if (!shouldPop || unpackAccessor(isHovered)) {
            return;
        }

        if (!unpackAccessor(canShowNotification)) {
            closeActiveNotification();
            return;
        }

        timerRef?.cancel();
        timerRef = timeout(delay, () => {
            shouldPop = false;

            const activeNotif = unpackAccessor(activeNotification);
            const newNotif = notificationsQueue.shift() ?? null;

            if (activeNotif && newNotif && activeNotif.id === newNotif.id) {
                updateNotification(String(activeNotif.id), newNotif);
            } else {
                closeActiveNotification();
                setActiveNotification(newNotif);
            }

            if (unpackAccessor(idleStatus) === IdleStatus.ACTIVE) {
                shouldPop = true;
                popNotification();
            }
        });
    };

    const notifServiceSub = NotificationService.connect('notified', (service, id) => {
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
            popNotification(Delay.ZERO);
        }
    });

    const canShowNotifSub = canShowNotification.subscribe(() => {
        if (!unpackAccessor(canShowNotification)) {
            notificationsQueue = [];
            popNotification(Delay.ZERO);
        }
    });

    const idleStatusSub = idleStatus.subscribe(() => {
        const isActive = unpackAccessor(idleStatus) === IdleStatus.ACTIVE;

        if (isActive) {
            shouldPop = true;

            if (unpackAccessor(activeNotification)) {
                popNotification();
            }
        }
    });

    const dontDisturbSub = dontDisturb.subscribe(() => {
        if (unpackAccessor(dontDisturb)) {
            popNotification(Delay.ZERO);
        }
    });

    const idleStatusCommandSub = app.connect('request', handleRequest(getIsIdleStatusCommandRequest, async (request) => {
        setIdleStatus(request.system.idleStatus);
    }));

    const dontDisturbCommandSub = app.connect('request', handleRequest(getIsDontDisturbCommandRequest, async (request) => {
        setDontDisturb(request.notifications.dontDisturb);
    }, { respondWith: () => getDontDisturbCommandResponse(dontDisturb.get()) }));

    const dontDisturbQuerySub = app.connect('request', handleRequest(getIsDontDisturbQueryRequest, () => undefined, {
        respondWith: () => getDontDisturbQueryResponse(dontDisturb.get())
    }));

    const dismissAllNotifsCommandSub = app.connect('request', handleRequest(getIsDismissAllNotificationsCommandRequest, () => {
        notificationsQueue = [];
        shouldPop = true;
        popNotification(Delay.ZERO);
    }));

    onCleanup(() => {
        NotificationService.disconnect(notifServiceSub);
        app.disconnect(idleStatusCommandSub);
        app.disconnect(dontDisturbCommandSub);
        app.disconnect(dontDisturbQuerySub);
        app.disconnect(dismissAllNotifsCommandSub);
        idleStatusSub();
        dontDisturbSub();
        canShowNotifSub();
    });

    return (
        <NotificationWindow
            notification={activeNotification}
            windowService={service}
            onClose={() => {
                if (unpackAccessor(isHovered)) {
                    setIsHovered(false);
                    popNotification(Delay.ZERO);
                }
            }}
            onHover={isHovered => {
                setIsHovered(isHovered);
                isHovered ? timerRef?.cancel() : popNotification();
            }}
        />
    );
}
