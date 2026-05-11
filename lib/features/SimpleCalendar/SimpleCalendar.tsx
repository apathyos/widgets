import { Calendar } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';

export interface ISimpleCalendar {
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function SimpleCalendar(props: ISimpleCalendar) {
    const { hexpand, vexpand, classes } = props;

    return (
        <Calendar
            hexpand={hexpand}
            vexpand={vexpand}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'calendar')),
            }}
        />
    );
}
