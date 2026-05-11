import { TrayConfigItem, TrayType } from '../types/tray';

export const trays: TrayConfigItem[] = [
    {
        name: 'notifications',
        value: TrayType.NOTIFICATIONS,
        Icon: () => <label label="󰵅" css="font-size: 125%;" />,
    },
    {
        name: 'calendar',
        value: TrayType.CALENDAR,
        Icon: '',
    },
];
