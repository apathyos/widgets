import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface IIcon {
    label: PropertyValue<string>;
    classes?: Classes<'root'>;
}

export function Icon(props: IIcon) {
    const { label, classes } = props;

    return <label class={updateAccessor(classes?.root, (root) => cn(root, 'icon'))} label={label} />;
}
