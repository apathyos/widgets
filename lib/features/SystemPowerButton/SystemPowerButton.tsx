import { PopupButton, IPopupButton } from '../../shared';
import { Classes, UnpackAcessor } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';
import { System } from '../../models/System';
import { LongClickProgressOverlay } from '../../shared/LongClickProgressOverlay';
import { Direction } from '../../types/common';

export interface ISystemPowerButton extends Pick<IPopupButton, 'isRootMounted' | 'halign' | 'vexpand' | 'hexpand'> {
    classes?: Classes<'root'>;
}

export function SystemPowerButton(props: ISystemPowerButton) {
    const system = new System();

    const actions = [
        {
            name: 'reboot',
            value: 'reboot',
            icon: '',
            onAct: () => system.reboot()
        },
        {
            name: 'shutdown',
            value: 'shutdown',
            icon: '󰤆',
            onAct: () => system.shutdown()
        }
    ];

    const items: (UnpackAcessor<IPopupButton['items']>[0])[] = actions.map(({ name, value, icon, onAct }) => ({
        name,
        value,
        icon,
        wrapper: ({ children }) => (
            <LongClickProgressOverlay
                direction={Direction.FORWARD}
                onDone={onAct}
            >
                {children}
            </LongClickProgressOverlay>
        )
    }));

    return (
        <PopupButton
            {...props}
            items={items}
            classes={{
                root: updateAccessor(props.classes?.root, root => cn(root, 'system-power-button'))
            }}
        >
            <label label="󰟩" hexpand halign={Gtk.Align.CENTER} />
        </PopupButton>
    );
}
