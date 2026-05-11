import cn from 'classnames';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { IModalBase, ModalBase } from '../base/ModalBase';
import { Classes, PropertyValue } from '../../types/utils';
import { isJSXElement } from '../../utils/typeguards';
import { Astal, Gtk } from 'ags/gtk4';
import { SPACING_XL } from '../../constants/widget';
import { With } from 'gnim';
import { SymbolButton } from '../buttons';

export interface IModal extends IModalBase {
    title?: PropertyValue<string> | JSX.Element;
    closable?: PropertyValue<boolean>;
    classes?: Classes<'title' | 'button' | 'close'> & IModalBase['classes'];
    onClose?: () => void;
}

export function Modal(props: IModal) {
    const {
        ref,
        title,
        closable = true,
        classes,
        onClose
    } = props;

    let windowRef: Astal.Window | null = null;

    return (
        <ModalBase
            {...props}
            ref={self => {
                windowRef = self;
                ref?.(self);
            }}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, root => cn(root, 'modal'))
            }}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={SPACING_XL}
                class="modal-content-container"
                hexpand
                vexpand
            >
                {closable || title ? (
                    <box class="modal-title-container" hexpand>
                        {title && (isJSXElement(title)
                            ? title
                            : (
                                    <label
                                        class={updateAccessor(classes?.title, title => cn(title, 'modal__title'))}
                                        label={title}
                                    />
                            )
                        )}

                        <With value={toAccessor(closable)}>
                            {(closable: boolean) => closable && (
                                <SymbolButton
                                    onClick={() => {
                                        onClose?.();
                                        windowRef?.destroy();
                                    }}
                                    hexpand
                                    halign={Gtk.Align.END}
                                    classes={{
                                        root: updateAccessor(
                                            classes?.close,
                                            (close) => cn(close, 'modal__close')
                                        )
                                    }}
                                >
                                    <label label="" />
                                </SymbolButton>
                            )}
                        </With>
                    </box>
                ) : null}

                {props.children}
            </box>
        </ModalBase>
    );
}
