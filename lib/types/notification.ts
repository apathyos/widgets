import Notifd from 'gi://AstalNotifd?version=0.1';

export interface INotification extends Notifd.Notification {}

export enum NotificationCategory {
    OSD = 'osd'
}
