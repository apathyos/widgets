import { createPoll } from 'ags/time';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';

export interface IDate {
    classes?: {
        root?: string;
        label?: string;
    };
}

export function Date(props: IDate) {
    const { classes } = props;

    const date = createPoll('', 500, "date '+%H:%M | %b %d, %a'");

    return (
        <box class={updateAccessor(classes?.root, root => cn(root, 'date'))}>
            <label class={updateAccessor(classes?.label, label => cn(label, 'date__label'))} label={date} />
        </box>
    );
}
