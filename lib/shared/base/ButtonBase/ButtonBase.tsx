import { Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue } from '../../../types/utils';
import { MouseButton } from '../../../types/widget';
import { toAccessor, unpackAccessor } from '@/utils/misc';
import { createComputed, onCleanup } from 'gnim';

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

    const clickController = new Gtk.GestureClick({ button: 0 });
    const clickSub = clickController.connect('pressed', (event) => {
        if (unpackAccessor(isInteractionDisabled)) {
            return;
        }

        if (event.get_current_button() === MouseButton.LEFT) {
            onClick?.({ event });
        } else if (event.get_current_button() === MouseButton.RIGHT) {
            onRightClick?.({ event });
        }
    });

    const hoverController = new Gtk.EventControllerMotion();
    const hoverEnterSub = hoverController.connect('enter', (event) => onHover?.({ event, isHovered: true }));
    const hoverLeaveSub = hoverController.connect('leave', (event) => onHover?.({ event, isHovered: false }));

    onCleanup(() => {
        clickController.disconnect(clickSub);
        hoverController.disconnect(hoverEnterSub);
        hoverController.disconnect(hoverLeaveSub);
    });

    return (
        <box
            $={(self) => {
                ref?.(self);
                self.add_controller(clickController);
                self.add_controller(hoverController);
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
