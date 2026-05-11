import { createComputed } from 'gnim';
import { Display } from '../../models/Display';
import { SymbolSliderButton } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface INightShiftButton {
    classes?: Classes<'root' | 'revealer' | 'slider' | 'label'>;
}

export function NightShiftButton(props: INightShiftButton) {
    const { classes } = props;

    const display = new Display();

    const min = display.getMinNightShiftLevel();
    const max = display.getMaxNightShiftLevel();
    const mid = min + (max - min) / 2;

    const currentValue = display.getCurrentNightShiftLevel();
    const nighShiftIcon = createComputed((get) => display.getNightshiftIcon({ currentValue: get(currentValue) }));

    return (
        <SymbolSliderButton
            min={min}
            max={max}
            value={currentValue}
            onClick={() => display.setNightShiftLevel({ value: currentValue.get() > mid ? min : max })}
            onChange={({ event: { value } }) => display.setNightShiftLevel({ value })}
            classes={{
                root: updateAccessor(
                    classes?.root,
                    (root, get) => cn(root, 'night-shift-button', `night-shift-button_${get(nighShiftIcon).level}`)
                ),
                revealer: updateAccessor(classes?.revealer, (revealer) => cn(revealer, 'night-shift-button__revealer')),
                slider: updateAccessor(classes?.slider, (slider) => cn(slider, 'night-shift-button__slider')),
            }}
        >
            <label
                class={updateAccessor(classes?.label, (label) => cn(label, 'night-shift-button__label'))}
                label={nighShiftIcon(v => v.icon)}
            />
        </SymbolSliderButton>
    );
}
