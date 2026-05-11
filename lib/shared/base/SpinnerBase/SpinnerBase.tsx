import { Gtk } from 'ags/gtk4';
import { Children, Classes } from '../../../types/utils';
import { Size } from '../../../types/common';
import { getEnumKeyFromValue, updateAccessor } from '../../../utils/misc';
import cn from 'classnames';

export interface ISpinnerBase {
    children?: Children;
    size: Size;
    classes?: Classes<'root'>;
}

export function SpinnerBase(props: ISpinnerBase) {
    const { size, classes } = props;

    return (
        <box
            homogeneous
            vexpand={false}
            hexpand={false}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            class={updateAccessor(classes?.root, root => cn(root, `spinner_${getEnumKeyFromValue(Size, size)?.toLowerCase()}`))}
        >
            {props.children}
        </box>
    );
}
