import { Accessor } from 'gnim';

export enum WindowId {
    TOP_BAR = 'top-bar',
    TASK_BAR = 'task-bar',
    STATUS_PANEL = 'status-panel',
    NOTIFICATION_LAYER = 'notification-layer',
    SYSTEM_MONITOR_LAYER = 'system-monitor-layer',
}

export type WindowMargin = {
    top?: number | Accessor<number>;
    left?: number | Accessor<number>;
    right?: number | Accessor<number>;
    bottom?: number | Accessor<number>;
};
