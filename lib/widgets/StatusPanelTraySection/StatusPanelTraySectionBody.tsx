import { With } from 'gnim';
import { NotificationList } from '../../features';
import { SimpleCalendar } from '../../features/SimpleCalendar';
import { TrayType } from '../../types/tray';
import { PropertyValue } from '../../types/utils';
import { toAccessor } from '../../utils/misc';

export interface IStatusPanelTraySectionBody {
    activeTray: PropertyValue<TrayType>;
}

export function StatusPanelTraySectionBody(props: IStatusPanelTraySectionBody) {
    const { activeTray } = props;

    return (
        <With value={toAccessor(activeTray)}>
            {(tray) => (tray === TrayType.CALENDAR ? <SimpleCalendar hexpand /> : <NotificationList />)}
        </With>
    );
}
