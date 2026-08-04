import { Gtk } from 'ags/gtk4';
import { IInputBase as IInputBaseType } from './types';
import { InputType } from '../../../types/input';
import { unpackAccessor } from '../../../utils/misc';

export interface IInputBase extends IInputBaseType<InputType.TEXT> {
}

export function InputBase(props: IInputBase) {
    const { text, placeholder, isFocused, classes, onChange, onSubmit } = props;

    return (
        <Gtk.Entry
            class={classes?.root}
            text={text}
            placeholderText={placeholder}
            vexpand={false}
            valign={Gtk.Align.CENTER}
            onMap={self => unpackAccessor(isFocused) && self.grab_focus()}
            onActivate={({ text }) => onSubmit?.({ value: text })}
            onNotifyText={({ text }) => onChange?.({ value: text })}
        />
    );
}
