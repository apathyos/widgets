import { Accessor } from 'gnim';

export const isAccessor = <T>(value: T | Accessor<T>): value is Accessor<T> => {
    return value instanceof Accessor;
};

export const isJSXElement = <T>(value: T | JSX.Element): value is JSX.Element => {
    return !!(value && typeof value === 'object' && '_init' in value && value._init);
};
