import Notifd from 'gi://AstalNotifd?version=0.1';

import { execAsync } from 'ags/process';
import { INotification, NotificationCategory } from '../../types/notification';
import { NotificationToastVariant } from '../../shared/NotificationToast/types';

export class Notification {
    constructor(private NotificationService: Notifd.Notifd) {}

    getNotifications(args?: {
        withOsd?: boolean;
    }) {
        const { withOsd } = args ?? {};
        const notifsIdsSet = new Set<number>();

        return this.NotificationService.notifications.sort((a, b) => b.time - a.time).filter(n => {
            if (notifsIdsSet.has(n.id)) {
                return false;
            }

            notifsIdsSet.add(n.id);

            if (!withOsd && n.category === NotificationCategory.OSD) {
                return false;
            }

            return true;
        });
    }

    dismissNotification(args: { id: string }) {
        const { id } = args;

        return execAsync(['sh', '-c', `$_APTH_BIN/system/notifications/close_notification ${id}`]);
    }

    dismissAllNotifications() {
        return new Promise<void>(res => {
            this.getNotifications().forEach((notif) => notif.dismiss());
            res();
        });
    }

    static getNotificationVariant(args: { notification: INotification }) {
        const { notification } = args;

        const category = notification.category;

        if (category === NotificationCategory.OSD) {
            return NotificationToastVariant.OSD;
        }

        return NotificationToastVariant.APP;
    }
}
