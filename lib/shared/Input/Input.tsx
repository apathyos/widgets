import { InputType } from '../../types/input';
import { PropertyValue } from '../../types/utils';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { IInputBase, InputBase, IPasswordInputBase, PasswordInputBase } from '../base/InputBase';
import cn from 'classnames';
import { Gtk } from 'ags/gtk4';
import { Spacing } from '../../types/common';
import { InputInfo, InputInfoType } from './types';
import Pango from 'gi://Pango';

export type IInput = (IInputBase | IPasswordInputBase) & {
    info?: PropertyValue<InputInfo | undefined>;
};

export function Input(props: IInput) {
    const { type, info } = props;

    let Content = null;

    const classes: typeof props.classes = {
        ...props.classes,
        root: updateAccessor(props.classes?.root, (root, get) => {
            const inputInfo = get(info);

            return cn(
                root,
                'input__field',
                inputInfo?.type === InputInfoType.ERROR && inputInfo.isPresent && 'input__field_error'
            );
        })
    };

    if (type === InputType.PASSWORD) {
        Content = <PasswordInputBase {...props} classes={classes} />;
    } else {
        Content = <InputBase {...props} classes={classes} />;
    }

    return (
        <box
            class="input"
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
