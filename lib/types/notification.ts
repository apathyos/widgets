import type Notifd from 'gi://AstalNotifd?version=0.1';

export interface INotification extends Notifd.Notification {
    isReplay?: boolean;
}

export enum NotificationCategory {
    OSD = 'osd'
}
