import { updateAccessor } from '../../../utils/misc';
import cn from 'classnames';
import { IPopupButtonBase, PopupButtonBase } from '../../base/PopupButtonBase';

export interface IPopupButton<P = object, V = string> extends IPopupButtonBase<P, V> {}

export function PopupButton<P = object, V = string>(props: IPopupButton<P, V>) {
    return (
        <PopupButtonBase
            {...props}
            classes={{
                root: updateAccessor(props.classes?.root, root => cn(root, 'popup-button'))
            }}
        />
    );
}
