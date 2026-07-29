import cn from 'classnames';
import { Children, Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';

export interface ISurface {
    ref?: (self: Gtk.Box) => void;
    children?: Children;
    orientation?: Gtk.Orientation;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    halign?: Gtk.Align;
    spacing?: PropertyValue<number>;
    valign?: Gtk.Align;
    css?: PropertyValue<string>;
    classes?: Classes<'root'>;
}

export function Surface(props: ISurface) {
    const { ref, orientation, hexpand, vexpand, halign, valign, spacing, css, classes } = props;

    return (
        <box
            $={ref}
            class={updateAccessor(classes?.root, (root) => cn(root, 'surface'))}
            orientation={orientation}
            hexpand={hexpand}
            vexpand={vexpand}
            halign={halign}
            valign={valign}
            spacing={spacing}
            css={css}
        >
            {props.children}
        </box>
    );
}
