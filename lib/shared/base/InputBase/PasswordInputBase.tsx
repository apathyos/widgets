import { Gtk } from 'ags/gtk4';
import { PropertyValue } from '../../../types/utils';
import { IInputBase } from './types';
import { InputType } from '../../../types/input';
import { unpackAccessor } from '../../../utils/misc';

export interface IPasswordInputBase extends IInputBase<InputType.PASSWORD> {
    showPeek?: PropertyValue<boolean>;
}

export function PasswordInputBase(props: IPasswordInputBase) {
    const {
        text,
        placeholder = 'password',
        isFocused,
        showPeek = true,
        classes,
        onChange,
        onSubmit
    } = props;

    return (
        <Gtk.PasswordEntry
            class={classes?.root}
            text={text}
            placeholderText={placeholder}
            showPeekIcon={showPeek}
            vexpand={false}
            valign={Gtk.Align.CENTER}
            onMap={self => unpackAccessor(isFocused) && self.grab_focus()}
            onActivate={({ text }) => onSubmit?.({ value: text })}
            onNotifyText={({ text }) => onChange?.({ value: text })}
        />
    );
}
