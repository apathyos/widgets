import { useSetupControllers } from '../../../hooks/use-setup-controllers';
import { Children, Classes, PropertyValue } from '../../../types/utils';
import { Gtk } from 'ags/gtk4';

export interface IModalBase {
    children: Children;
    ref?: (self: Gtk.Box) => void;
    orientation?: PropertyValue<Gtk.Orientation>;
    spacing?: PropertyValue<number>;
    classes?: Classes<'root'>;
    onClick?: (args: { event: Gtk.GestureClick }) => void;
    onMouseMove?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseEnter?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseLeave?: (args: { event: Gtk.EventControllerMotion }) => void;
    onKeyDown?: (args: { event: Gtk.EventControllerKey }) => void;
}

export function ModalBase(props: IModalBase) {
    const {
        ref,
        orientation,
        spacing,
        classes,
        onClick,
        onMouseMove,
        onMouseEnter,
        onMouseLeave,
        onKeyDown,
    } = props;

    const { onSetup } = useSetupControllers({ onClick, onMouseMove, onMouseEnter, onMouseLeave, onKeyDown });

    return (
        <Gtk.Box
            $={self => {
                onSetup(self);
                ref?.(self);
            }}
            hexpand={false}
            orientation={orientation}
            spacing={spacing}
            class={classes?.root}
        >
            {props.children}
        </Gtk.Box>
    );
}
