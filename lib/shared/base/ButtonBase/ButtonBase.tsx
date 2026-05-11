import { Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue } from '../../../types/utils';
import { MouseButton } from '../../../types/widget';

export interface IButtonBase {
    ref?: (self: Gtk.Box) => void;
    children?: Children;
    halign?: PropertyValue<Gtk.Align>;
    valign?: PropertyValue<Gtk.Align>;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    spacing?: PropertyValue<number>;
    isVisible?: PropertyValue<boolean>;
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
        classes,
        onClick,
        onRightClick,
        onHover
    } = props;

    const clickController = new Gtk.GestureClick({ button: 0 });
    clickController.connect('pressed', (event) => {
        if (event.get_current_button() === MouseButton.LEFT) {
            onClick?.({ event });
        } else if (event.get_current_button() === MouseButton.RIGHT) {
            onRightClick?.({ event });
        }
    });

    const hoverConnector = new Gtk.EventControllerMotion();
    hoverConnector.connect('enter', (event) => onHover?.({ event, isHovered: true }));
    hoverConnector.connect('leave', (event) => onHover?.({ event, isHovered: false }));

    return (
        <box
            $={(self) => {
                ref?.(self);
                self.add_controller(clickController);
                self.add_controller(hoverConnector);
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
