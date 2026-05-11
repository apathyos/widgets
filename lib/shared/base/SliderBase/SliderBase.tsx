import { Astal } from 'ags/gtk4';
import { Classes, PropertyValue } from '../../../types/utils';

export interface ISliderBase {
    max: PropertyValue<number>;
    min: PropertyValue<number>;
    value: PropertyValue<number>;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
    onChange?: (args: { event: Astal.Slider }) => void;
}

export function SliderBase(props: ISliderBase) {
    const { max, min, value, hexpand, vexpand, classes, onChange } = props;

    return (
        <slider
            onChangeValue={(event) => {
                onChange?.({ event });
            }}
            max={max}
            min={min}
            value={value}
            hexpand={hexpand}
            vexpand={vexpand}
            class={classes?.root}
        />
    );
}
