import { Gtk } from 'ags/gtk4';
import { PropertyValue } from '../../../types/utils';
import { IInputBase } from './types';
import { InputType } from '../../../types/input';
import { toAccessor, unpackAccessor } from '../../../utils/misc';

export interface IPasswordInputBase extends IInputBase<InputType.PASSWORD> {
    showPeek?: PropertyValue<boolean>;
}

export function PasswordInputBase(props: IPasswordInputBase) {
    const {
        ref,
        text,
        placeholder = 'password',
        isFocused,
        isDisabled,
        showPeek = true,
        classes,
        onChange,
        onSubmit
    } = props;

    const isAllowedEdit = toAccessor(isDisabled)(v => !v);

    return (
        <Gtk.PasswordEntry
            $={ref}
            class={classes?.root}
            text={text}
            placeholderText={placeholder}
            showPeekIcon={showPeek}
            vexpand={false}
            valign={Gtk.Align.CENTER}
            focusable={isAllowedEdit}
            canFocus={isAllowedEdit}
            editable={isAllowedEdit}
            onMap={self => unpackAccessor(isFocused) && unpackAccessor(isAllowedEdit) && self.grab_focus()}
            onActivate={({ text }) => onSubmit?.({ value: text })}
            onNotifyText={({ text }) => onChange?.({ value: text })}
        />
    );
}
