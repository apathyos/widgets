import { updateAccessor } from '../../../utils/misc';
import { ButtonBase, IButtonBase } from '../../base/ButtonBase';
import cn from 'classnames';

export interface IButton extends IButtonBase {}

export function Button(props: IButton) {
    const { classes } = props;

    return (
        <ButtonBase
            {...props}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, (root) => cn(root, 'button')),
            }}
        />
    );
}
