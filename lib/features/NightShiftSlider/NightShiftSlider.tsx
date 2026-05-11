import { SymbolSlider } from '../../shared';
import { Display } from '../../models/Display';
import { createComputed } from 'gnim';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface INightShiftSlider {
    classes?: Classes<'root' | 'label'>;
}

export function NightShiftSlider(props: INightShiftSlider) {
    const { classes } = props;

    const display = new Display();

    const min = display.getMinNightShiftLevel();
    const max = display.getMaxNightShiftLevel();
    const mid = min + (max - min) / 2;

    const currentValue = display.getCurrentNightShiftLevel();
    const icon = createComputed((get) => (get(currentValue) > mid ? '' : ''));

    return (
        <SymbolSlider
            min={min}
            max={max}
            value={currentValue}
            onClick={() => display.setNightShiftLevel({ value: currentValue.get() > mid ? min : max })}
            onChange={({ event: { value } }) => display.setNightShiftLevel({ value: Math.floor(value) })}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'night-shift-slider')),
            }}
        >
            <label
                class={updateAccessor(classes?.label, (label) => cn(label, 'night-shift-slider__label'))}
                label={icon}
            />
        </SymbolSlider>
    );
}
