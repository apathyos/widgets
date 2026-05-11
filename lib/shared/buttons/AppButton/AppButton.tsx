import { updateAccessor } from '../../../utils/misc';
import { ButtonBase, IButtonBase } from '../../base/ButtonBase';
import cn from 'classnames';
import { IconSize } from '../../../types/widget';
import { Children, Classes, PropertyValue } from '../../../types/utils';

export interface IAppButton extends IButtonBase {
    content?: {
        before?: Children;
        after?: Children;
    };
    icon: PropertyValue<string>;
    size?: PropertyValue<IconSize>;
    classes?: Classes<'root' | 'icon'>;
}

export function AppButton(props: IAppButton) {
    const { content, icon, size = IconSize.XL, ...rest } = props;

    return (
        <ButtonBase
            {...rest}
            hexpand={false}
            vexpand={false}
            classes={{
                ...rest.classes,
                root: updateAccessor(rest.classes?.root, root => cn(root, 'app-button'))
            }}
        >
            {content?.before}

            <image
                class={updateAccessor(rest.classes?.icon, icon => cn(icon, 'app-button__icon'))}
                iconName={icon}
                pixelSize={size}
            />

            {content?.after}
        </ButtonBase>
    );
}
