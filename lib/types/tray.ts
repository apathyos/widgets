import { ListItem } from './common';

export enum TrayType {
    NOTIFICATIONS,
    CALENDAR,
}

export type TrayConfigItem = ListItem<object, TrayType> & {
    Icon: string | (() => JSX.Element);
};
