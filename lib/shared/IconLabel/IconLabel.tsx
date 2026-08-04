import cn from 'classnames';
import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import { Icon, IIcon } from '../Icon/Icon';
import { ITitle, Title } from '../Title';
import { Spacing } from '@/types/common';

export interface IIconLabel {
    icon: IIcon['label'];
    label: ITitle['label'];
    spacing?: PropertyValue<number>;
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function IconLabel(props: IIconLabel) {
    const { icon, label, spacing = Spacing.S, classes } = props;

    return (
        <box class={updateAccessor(classes?.root, (root) => cn(root, 'icon-label'))} spacing={spacing}>
            <Icon
                classes={{ root: updateAccessor(classes?.icon, (icon) => cn(icon, 'icon-label__icon')) }}
                label={icon}
            />
            <Title
                classes={{ root: updateAccessor(classes?.label, (label) => cn(label, 'icon-label__label')) }}
                label={label}
            />
        </box>
    );
}
