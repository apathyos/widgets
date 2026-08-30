import { Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue } from '../../../types/utils';
import { MouseButton } from '../../../types/widget';
import { toAccessor, unpackAccessor } from '@/utils/misc';
import { createComputed } from 'gnim';
import { useSetupControllers } from '@/hooks/use-setup-controllers';

export interface IButtonBase {
    ref?: (self: Gtk.Box) => void;
    children?: Children;
    halign?: PropertyValue<Gtk.Align>;
    valign?: PropertyValue<Gtk.Align>;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    spacing?: PropertyValue<number>;
    isVisible?: PropertyValue<boolean>;
    isDisabled?: PropertyValue<boolean>;
    isInactive?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
    onClick?: (args: { event: Gtk.GestureClick }) => void;
    onRightClick?: (args: { event: Gtk.GestureClick }) => void;
    onHover?: (args: { event: Gtk.EventControllerMotion; isHovered: boolean }) => void;
}

export function ButtonBase(props: IButtonBase) {
    const {
        ref,
        halign,
        valign,
        hexpand,
        vexpand,
        spacing,
        isVisible,
        isDisabled,
        isInactive,
        classes,
        onClick,
        onRightClick,
        onHover
    } = props;

    const isInteractionDisabled = createComputed(get => {
        return get(toAccessor(isInactive)) || get(toAccessor(isDisabled));
    });

    const { onSetup } = useSetupControllers({
        onClick: ({ event }) => {
            if (unpackAccessor(isInteractionDisabled)) {
                return;
            }

            if (event.get_current_button() === MouseButton.LEFT) {
                onClick?.({ event });
            } else if (event.get_current_button() === MouseButton.RIGHT) {
                onRightClick?.({ event });
            }
        },
        onMouseEnter: ({ event }) => onHover?.({ event, isHovered: true }),
        onMouseLeave: ({ event }) => onHover?.({ event, isHovered: false })
    });

    return (
        <box
            $={(self) => {
                ref?.(self);
                onSetup(self);
            }}
            halign={halign}
            valign={valign}
            hexpand={hexpand}
            vexpand={vexpand}
            spacing={spacing}
            visible={isVisible}
            class={classes?.root}
        >
            {props.children}
        </box>
    );
}
