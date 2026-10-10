import { Gtk } from 'ags/gtk4';
import { InputType } from '../../../types/input';
import { Classes, PropertyValue } from '../../../types/utils';

export interface IInputBase<T extends InputType> {
    type: T;
    ref?: (self: Gtk.Entry | Gtk.PasswordEntry) => void;
    text?: PropertyValue<string>;
    placeholder?: PropertyValue<string>;
    isFocused?: PropertyValue<boolean>;
    isDisabled?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
    onChange?: (args: { value: string }) => void;
    onSubmit?: (args: { value: string }) => void;
}
