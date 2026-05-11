import { Gtk } from 'ags/gtk4';
import { Classes, PropertyValue } from '../../../types/utils';
import { updateAccessor } from '../../../utils/misc';
import { ISlider, Slider } from '../../Slider';
import { ISymbolButton, SymbolButton } from '../SymbolButton';
import cn from 'classnames';

export interface ISymbolSlider extends ISymbolButton {
    min: PropertyValue<number>;
    max: PropertyValue<number>;
    value: PropertyValue<number>;
    orientation?: Gtk.Orientation;
    classes?: Classes<'root' | 'icon' | 'slider'>;
    onChange?: ISlider['onChange'];
}

export function SymbolSlider(props: ISymbolSlider) {
    const { min, max, value, orientation = Gtk.Orientation.HORIZONTAL, classes, onChange } = props;

    return (
        <box class={updateAccessor(classes?.root, (root) => cn(root, 'symbol-slider'))} orientation={orientation}>
            <SymbolButton
                {...props}
                classes={{
                    root: updateAccessor(classes?.icon, (icon) => cn(icon, 'symbol-slider__icon')),
                }}
            >
                {props.children}
            </SymbolButton>
            <Slider
                min={min}
                max={max}
                value={value}
                onChange={onChange}
                hexpand={orientation === Gtk.Orientation.HORIZONTAL}
                vexpand={orientation === Gtk.Orientation.VERTICAL}
                classes={{
                    root: updateAccessor(classes?.slider, (slider) => cn(slider, 'symbol-slider__slider')),
                }}
            />
        </box>
    );
}
