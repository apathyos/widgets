import { InputType } from '../../types/input';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { IInputBase, InputBase, IPasswordInputBase, PasswordInputBase } from '../base/InputBase';
import cn from 'classnames';
import { Gtk } from 'ags/gtk4';
import { Spacing } from '../../types/common';
import { InputInfo, InputInfoType } from './types';
import Pango from 'gi://Pango';
import { createEffect } from 'ags';

type InputProps = (IInputBase | IPasswordInputBase);

export type IInput = InputProps & {
    info?: PropertyValue<InputInfo | undefined>;
    classes?: InputProps['classes'] & Classes<'field'>;
};

export function Input(props: IInput) {
    const { type, info, isFocused, isDisabled } = props;

    let ref: Gtk.Entry | Gtk.PasswordEntry | null = null;
    const isAllowedEdit = toAccessor(isDisabled)(v => !v);

    createEffect(() => {
        const allowedEdit = unpackAccessor(isAllowedEdit, true);

        if (!allowedEdit) {
            ref?.get_root()?.set_focus(null);
            return;
        }

        if (allowedEdit && unpackAccessor(isFocused)) {
            ref?.grab_focus();
        }
    });

    const classes: typeof props.classes = {
        ...props.classes,
        root: updateAccessor(props.classes?.field, (field, get) => {
            const inputInfo = get(info);

            return cn(
                field,
                'input__field',
                inputInfo?.type === InputInfoType.ERROR && inputInfo.isPresent && 'input__field_error'
            );
        })
    };

    let Content = null;

    if (type === InputType.PASSWORD) {
        Content = <PasswordInputBase {...props} ref={self => (ref = self)} classes={classes} />;
    } else {
        Content = <InputBase {...props} ref={self => (ref = self)} classes={classes} />;
    }

    return (
        <box
            class={updateAccessor(classes.root, (root, get) => cn(
                'input',
                root,
                get(toAccessor(isDisabled)) && 'input_disabled'
            ))}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={Spacing.S}
        >
            {Content}

            <label
                class={updateAccessor(info, info => cn(
                    'input__info-text',
                    info?.isPresent && info.text && 'input__info-text_visible'
                ))}
                label={toAccessor(info)(v => v?.isPresent && v.text || '')}
                halign={toAccessor(info)(v => v?.halign ?? Gtk.Align.START)}
                xalign={0}
                ellipsize={Pango.EllipsizeMode.END}
                tooltipText={toAccessor(info)(v => v?.text ?? '')}
            />
        </box>
    );
}
