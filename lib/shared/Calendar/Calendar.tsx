import { Gtk } from 'ags/gtk4';
import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface ICalendar {
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function Calendar(props: ICalendar) {
    const { hexpand, vexpand, classes } = props;

    return (
        <Gtk.Calendar
            hexpand={hexpand}
            vexpand={vexpand}
            showDayNames
            showHeading
            class={updateAccessor(classes?.root, (root) => cn(root, 'calendar'))}
        />
    );
}
