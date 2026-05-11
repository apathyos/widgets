import Pango from 'gi://Pango?version=1.0';
import { Classes, PropertyValue } from '../../../types/utils';
import { updateAccessor } from '../../../utils/misc';
import { DropDownButton, IDropDownButton } from '../DropDownButton';
import cn from 'classnames';
import { SPACING_L } from '../../../constants/widget';

export interface IIconDropDownButton extends Omit<IDropDownButton, 'children'> {
    icon: PropertyValue<string>;
    label: PropertyValue<string>;
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function IconDropDownButton(props: IIconDropDownButton) {
    const { icon, label, classes } = props;

    return (
        <DropDownButton
            {...props}
            listItemMaxWidthChar={15}
            classes={{
                ...classes,
                buttonClasses: {
                    root: updateAccessor(classes?.root, (root) => cn(root, 'icon-dropdown-button')),
                },
            }}
        >
            <box spacing={SPACING_L}>
                <label
                    class={updateAccessor(classes?.icon, (icon) => cn(icon, 'icon-dropdown-button__icon'))}
                    label={icon}
                />
                <label
                    class={updateAccessor(classes?.label, (label) => cn(label, 'icon-dropdown-button__label'))}
                    label={label}
                    ellipsize={Pango.EllipsizeMode.MIDDLE}
                    maxWidthChars={15}
                />
            </box>
        </DropDownButton>
    );
}
