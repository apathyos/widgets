import { TrayType } from '../../types/tray';
import { trays } from '../../config/tray';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { ITabs, SymbolButton, Tabs } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { SPACING_M } from '../../constants/widget';

export interface ITraySelector {
    activeTray: PropertyValue<TrayType>;
    onSelect: (tray: TrayType) => void;
    classes?: Classes<'root' | 'button'>;
}

export function TraySelector(props: ITraySelector) {
    const { activeTray, onSelect, classes } = props;

    // const items: ITabs<object, TrayType>['items'] = trays.map(({ name, value, Icon }) => ({
    //     name,
    //     value,
    //     component: typeof Icon === 'function' ? <Icon /> : <label label={Icon} />
    // }));

    return (
        // <Tabs
        //     active={activeTray}
        //     items={items}
        //     classes={{
        //         root: updateAccessor(classes?.root, root => cn(root, 'tray-selector')),
        //         item: updateAccessor(classes?.button, button => cn(button, 'tray-selector__button'))
        //     }}
        //     onSelect={item => onSelect(item.value)}
        // />
        <box class={updateAccessor(classes?.root, (root) => cn(root, 'tray-selector'))} spacing={SPACING_M}>
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
