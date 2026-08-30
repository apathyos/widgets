import { updateAccessor } from '../../../utils/misc';
import cn from 'classnames';
import { IPopupButtonBase, PopupButtonBase } from '../../base/PopupButtonBase';

export interface IPopupButton<P = object> extends IPopupButtonBase<P> {}

export function PopupButton<P>(props: IPopupButton<P>) {
    return (
        <PopupButtonBase
            {...props}
            classes={{
                root: updateAccessor(props.classes?.root, root => cn(root, 'popup-button'))
            }}
        />
    );
}
