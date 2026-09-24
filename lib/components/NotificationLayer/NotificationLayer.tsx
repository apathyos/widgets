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
import { compareByWeights, unpackAccessor } from '../../utils/misc';
import { INotification, NotificationCategory } from '../../types/notification';
import { Delay } from '../../types/common';
import { useWindowSystem } from '../../contexts/windowing';
import { WindowType } from '../../types/windowing';
import { NotificationCommand } from '../../models/Notification/types/windowing';
import { onCleanup } from 'ags';
import { NotificationWindow } from '../../features';
import { uniqBy } from 'lodash';
import { getNotificationWeights } from '@/utils/system';

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
                timerRef?.cancel();
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

    const notifServiceNotifiedSub = NotificationService.connect('notified', (service, id) => {
        if (!unpackAccessor(canShowNotification)) {
            return;
        }

        const newNotification = service.get_notification(id);

        if (!newNotification) {
            return;
        }

        const activeNotif = unpackAccessor(activeNotification);
        let shouldDisplayNow = false;

        if (!activeNotif) {
            // If there is no displaying notification we should show this one
            shouldDisplayNow = true;
        } else if (compareByWeights(getNotificationWeights(newNotification), getNotificationWeights(activeNotif))) {
            // Show new notification if it is more important than the current one
            shouldDisplayNow = true;
        } else if (newNotification.category === NotificationCategory.OSD) {
            // Show OSD notifications
            shouldDisplayNow = true;
        }

        const newNotificationsQueue = [...notificationsQueue, newNotification];

        if (activeNotif && shouldDisplayNow) {
            activeNotif.isReplay = true;
            newNotificationsQueue.push(activeNotif);
        }

        notificationsQueue = uniqBy(newNotificationsQueue.toSorted(
            (a, b) => compareByWeights(getNotificationWeights(a), getNotificationWeights(b))
        ), v => v.id);

        if (shouldDisplayNow) {
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

        notificationsQueue = [];
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
        NotificationService.disconnect(notifServiceNotifiedSub);
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
