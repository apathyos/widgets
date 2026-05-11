import { Accessor } from 'ags';
import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import Pango from 'gi://Pango?version=1.0';

export interface ITitle {
    label: PropertyValue<string> | JSX.Element;
    maxWidth?: PropertyValue<number>;
    ellipsizeMode?: Pango.EllipsizeMode;
    classes?: Classes<'root'>;
}

export function Title(props: ITitle) {
    const { label, maxWidth, ellipsizeMode = Pango.EllipsizeMode.END, classes } = props;
    const className = updateAccessor(classes?.root, (root) => cn(root, 'title'));

    if (typeof label === 'string' || label instanceof Accessor) {
        return <label class={className} label={label} ellipsize={ellipsizeMode} maxWidthChars={maxWidth} />;
    }

    return <box class={className}>{label}</box>;
}
