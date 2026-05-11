import { updateAccessor } from '../../../utils/misc';
import { IPopupButtonBase, PopupButtonBase } from '../../base/PopupButtonBase';
import cn from 'classnames';

export interface ISymbolPopupButton extends IPopupButtonBase {}

export function SymbolPopupButton(props: ISymbolPopupButton) {
    return (
        <PopupButtonBase
            {...props}
            hexpand={false}
            vexpand={false}
            classes={{
                root: updateAccessor(props.classes?.root, root => cn(root, 'symbol-popup-button'))
            }}
        />
    );
}
