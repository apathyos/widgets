import { Gtk } from 'ags/gtk4';
import { IInputBase as IInputBaseType } from './types';
import { InputType } from '../../../types/input';
import { toAccessor, unpackAccessor } from '../../../utils/misc';

export interface IInputBase extends IInputBaseType<InputType.TEXT> {}

export function InputBase(props: IInputBase) {
    const { ref, text, placeholder, isFocused, isDisabled, classes, onChange, onSubmit } = props;

    const isAllowedEdit = toAccessor(isDisabled)(v => !v);

    return (
        <Gtk.Entry
            $={ref}
            class={classes?.root}
            text={text}
            placeholderText={placeholder}
            vexpand={false}
            valign={Gtk.Align.CENTER}
            focusable={isAllowedEdit}
            canFocus={isAllowedEdit}
            editable={isAllowedEdit}
            onMap={self => unpackAccessor(isFocused) && self.grab_focus()}
            onActivate={({ text }) => onSubmit?.({ value: text })}
            onNotifyText={({ text }) => onChange?.({ value: text })}
        />
    );
}
