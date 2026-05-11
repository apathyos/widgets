import cn from 'classnames';
import { Classes, PropertyValue } from '../../types/utils';
import { Gtk } from 'ags/gtk4';
import { updateAccessor } from '../../utils/misc';

export interface ISection {
    children: JSX.Element | JSX.Element[];
    spacing?: PropertyValue<number>;
    orientation?: Gtk.Orientation;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function Section(props: ISection) {
    const { spacing, orientation = Gtk.Orientation.HORIZONTAL, hexpand, vexpand, classes } = props;

    return (
        <box
            class={updateAccessor(classes?.root, (root) => cn(root, 'section'))}
            spacing={spacing}
            orientation={orientation}
            hexpand={hexpand}
            vexpand={vexpand}
        >
            {props.children}
        </box>
    );
}
