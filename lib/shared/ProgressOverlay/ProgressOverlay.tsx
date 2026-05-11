import { Direction } from '../../types/common';
import { Children, Classes, PropertyValue } from '../../types/utils';
import { toAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { createComputed } from 'gnim';
import { Gtk } from 'ags/gtk4';
import { getGradientAxisFromDirection } from '../../utils/styles';

export interface IProgressOverlay {
    children: Children;
    ref?: (self: Gtk.Overlay) => void;
    value: PropertyValue<number>;
    showValue?: PropertyValue<boolean>;
    direction: PropertyValue<Direction>;
    classes?: Classes<'root' | 'value'>;
}

export function ProgressOverlay(props: IProgressOverlay) {
    const { ref, value, showValue, direction, classes } = props;

    const gradientDirection = createComputed(get => getGradientAxisFromDirection({ direction: get(toAccessor(direction)) }));

    return (
        <overlay
            $={ref}
            class={updateAccessor(classes?.root, root => cn(root, 'progress-overlay'))}
        >
            <box
                homogeneous
                canTarget={toAccessor(showValue)(v => !v)}
                class={updateAccessor(
                    showValue,
                    showValue => cn(
                        'progress-overlay__content-container',
                        showValue && 'progress-overlay__content-container_with-value'
                    )
                )}
            >
                {props.children}
            </box>
            <box
                $type="overlay"
                class="progress-overlay__overlay"
                canTarget={false}
                css={createComputed(get => `
                    --progress-overlay-value: ${get(toAccessor(value))}%;
                    --progress-overlay-direction: ${get(gradientDirection)};
                `)}
            >
                <label
                    class={updateAccessor(classes?.value, value => cn(value, 'progress-overlay__value'))}
                    vexpand
                    hexpand
                    label={updateAccessor(showValue, (showValue, get) => showValue ? `${get(value)}%` : '')}
                />
            </box>
        </overlay>
    );
}
