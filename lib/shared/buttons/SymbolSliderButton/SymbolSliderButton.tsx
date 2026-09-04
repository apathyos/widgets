import { createState } from 'gnim';
import { ISymbolButton, SymbolButton } from '../SymbolButton';
import cn from 'classnames';
import { Revealer } from '../../';
import { ISlider, Slider } from '../../Slider';
import { Classes, PropertyValue } from '../../../types/utils';
import { Gtk } from 'ags/gtk4';
import { updateAccessor } from '../../../utils/misc';

export interface ISymbolSliderButton extends ISymbolButton {
    min: PropertyValue<number>;
    max: PropertyValue<number>;
    value: PropertyValue<number>;
    transitionType?: Gtk.RevealerTransitionType;
    transitionDuration?: number;
    classes?: Classes<'root' | 'revealer' | 'slider'>;
    onChange?: ISlider['onChange'];
}

export function SymbolSliderButton(props: ISymbolSliderButton) {
    const {
        min,
        max,
        value,
        transitionType = Gtk.RevealerTransitionType.SLIDE_LEFT,
        transitionDuration,
        classes,
        onChange,
    } = props;

    const [isRevealed, setIsRevealed] = createState(false);

    return (
        <SymbolButton
            {...props}
            onRightClick={(args) => {
                setIsRevealed(!isRevealed.get());
                props.onRightClick?.(args);
            }}
            onHover={({ isHovered }) => !isHovered && setIsRevealed(false)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'symbol-slider-button')),
            }}
        >
            <>
                {props.children}

                <Revealer
                    isRevealed={isRevealed}
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                    classes={{
                        root: updateAccessor(
                            classes?.revealer,
                            (revealer) => cn(revealer, 'symbol-slider-button__revealer')
                        )
                    }}
                >
                    {() => (
                        <Slider
                            classes={{
                                root: updateAccessor(
                                    classes?.slider,
                                    (slider) => cn(slider, 'symbol-slider-button__slider'),
                                )
                            }}
                            min={min}
                            max={max}
                            value={value}
                            onChange={onChange}
                        />
                    )}
                </Revealer>
            </>
        </SymbolButton>
    );
}
