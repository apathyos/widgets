import { PopupButton, IPopupButton } from '../../shared';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { stableAccessor, updateAccessor } from '../../utils/misc';
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

    const values = stableAccessor(actions, { compose: actions => actions.map(a => a.value) });

    return (
        <PopupButton
            {...props}
            values={values}
            classes={{
                root: updateAccessor(props.classes?.root, root => cn(root, 'system-power-button'))
            }}
            getItem={value => {
                const action = actions.find(a => a.value === value);

                if (!action) {
                    return null;
                }

                return {
                    ...action,
                    wrapper: ({ children }) => (
                        <LongClickProgressOverlay
                            direction={Direction.FORWARD}
                            onDone={action.onAct}
                        >
                            {children}
                        </LongClickProgressOverlay>
                    )
                };
            }}
        >
            <label label="󰟩" hexpand halign={Gtk.Align.CENTER} />
        </PopupButton>
    );
}
