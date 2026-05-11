import { Gtk } from 'ags/gtk4';
import { ButtonBase, IButtonBase } from '../../base/ButtonBase';
import cn from 'classnames';
import { updateAccessor } from '../../../utils/misc';

export interface ISymbolButton extends IButtonBase {};

export function SymbolButton(props: ISymbolButton) {
    const { halign = Gtk.Align.CENTER, classes } = props;

    return (
        <ButtonBase
            {...props}
            halign={halign}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'symbol-button')),
            }}
        />
    );
}
