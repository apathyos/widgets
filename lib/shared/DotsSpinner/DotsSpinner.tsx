import { updateAccessor } from '../../utils/misc';
import { ISpinnerBase, SpinnerBase } from '../base/SpinnerBase';
import cn from 'classnames';

export interface IDotsSpinner extends Omit<ISpinnerBase, 'children'> {}

export function DotsSpinner(props: IDotsSpinner) {
    const { classes } = props;

    return (
        <SpinnerBase
            {...props}
            classes={{
                ...props.classes,
                root: updateAccessor(classes?.root, root => cn(root, 'dots-spinner')),
            }}
        />
    );
}
