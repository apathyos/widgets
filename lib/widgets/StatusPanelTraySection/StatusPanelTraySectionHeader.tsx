import { Gtk } from 'ags/gtk4';
import { NotificationListControls, TraySelector } from '../../features';
import { TrayType } from '../../types/tray';
import { PropertyValue } from '../../types/utils';
import { With } from 'gnim';
import { toAccessor } from '../../utils/misc';

export interface IStatusPanelTraySectionHeader {
    activeTray: PropertyValue<TrayType>;
    setActiveTray: (tray: TrayType) => void;
}

export function StatusPanelTraySectionHeader(props: IStatusPanelTraySectionHeader) {
    const { activeTray, setActiveTray } = props;

    return (
        <box hexpand>
            <box hexpand>
                <With value={toAccessor(activeTray)}>
                    {(tray) => (tray === TrayType.CALENDAR ? null : <NotificationListControls />)}
                </With>
            </box>
            <box hexpand={false} halign={Gtk.Align.END}>
                <TraySelector activeTray={activeTray} onSelect={setActiveTray} />
            </box>
        </box>
    );
}
