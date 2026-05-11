import cn from 'classnames';
import { Children, Classes, PropertyValue } from '../../types/utils';
import { Gtk } from 'ags/gtk4';

export interface IBar {
    children: Children;
    ref?: (self: Gtk.Box) => void;
    spacing?: PropertyValue<number>;
    halign?: PropertyValue<Gtk.Align>;
    valign?: PropertyValue<Gtk.Align>;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    homogenous?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
    onHover?: (args: { event: Gtk.EventControllerMotion; isHovered: boolean }) => void;
}

export function Bar(props: IBar) {
    const {
        children,
        ref,
        spacing,
        halign,
        valign,
        hexpand,
        vexpand,
        homogenous,
        classes,
        onHover
    } = props;

    const hoverConnector = new Gtk.EventControllerMotion();
    hoverConnector.connect('enter', (event) => onHover?.({ event, isHovered: true }));
    hoverConnector.connect('leave', (event) => onHover?.({ event, isHovered: false }));

    return (
        <box
            $={self => {
                self.add_controller(hoverConnector);

                ref?.(self);
            }}
            class={cn('bar', classes?.root)}
            spacing={spacing}
            halign={halign}
            valign={valign}
            hexpand={hexpand}
            vexpand={vexpand}
            homogeneous={homogenous}
        >
            {children}
        </box>
    );
}
