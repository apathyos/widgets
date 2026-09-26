import { TrayType } from '../../types/tray';
import { trays } from '../../config/tray';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { SymbolButton } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { Spacing } from '@/types/common';
import { Gtk } from 'ags/gtk4';

export interface ITraySelector {
    activeTray: PropertyValue<TrayType>;
    onSelect: (tray: TrayType) => void;
    classes?: Classes<'root' | 'button'>;
}

export function TraySelector(props: ITraySelector) {
    const { activeTray, onSelect, classes } = props;

    return (
        <box
            class={updateAccessor(classes?.root, (root) => cn(root, 'tray-selector'))}
            spacing={Spacing.S}
            valign={Gtk.Align.CENTER}
        >
            {trays.map(({ value, Icon }) => (
                <SymbolButton
                    classes={{
                        root: updateAccessor(
                            classes?.button,
                            (button, get) => cn(
                                button,
                                'tray-selector__button',
                                get(toAccessor(activeTray)) === value && 'tray-selector__button_active',
                            )
                        )
                    }}
                    onClick={() => onSelect(value)}
                >
                    {typeof Icon === 'function' ? <Icon /> : Icon}
                </SymbolButton>
            ))}
        </box>
    );
}
