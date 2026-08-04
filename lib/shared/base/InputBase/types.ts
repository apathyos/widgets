import { InputType } from '../../../types/input';
import { Classes, PropertyValue } from '../../../types/utils';

export interface IInputBase<T extends InputType> {
    type: T;
    text?: PropertyValue<string>;
    placeholder?: PropertyValue<string>;
    isFocused?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
    onChange?: (args: { value: string }) => void;
    onSubmit?: (args: { value: string }) => void;
}
