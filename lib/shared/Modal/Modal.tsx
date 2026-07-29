import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import { IModalBase, ModalBase } from '../base/ModalBase';
import { Classes } from '../../types/utils';
import { Gtk } from 'ags/gtk4';
import { Spacing } from '../../types/common';

export interface IModal extends IModalBase {
    classes?: Classes<'title' | 'button' | 'close'> & IModalBase['classes'];
}

export function Modal(props: IModal) {
    const { classes } = props;

    return (
        <ModalBase
            {...props}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, root => cn(root, 'modal'))
            }}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={Spacing.XL}
                class="modal-content-container"
                hexpand
                vexpand
            >
                {props.children}
            </box>
        </ModalBase>
    );
}
