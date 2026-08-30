import { PropertyValue } from '@/types/utils';
import { Accessor } from 'gnim';
import { unpackAccessor } from './misc';

export const isAccessor = <T>(value: T | Accessor<T>): value is Accessor<T> => {
    return value instanceof Accessor;
};

export const isJSXElement = <T>(value: T | JSX.Element): value is JSX.Element => {
    return !!(value && typeof value === 'object' && '_init' in value && value._init);
};

export const isNonNullableAccessor = <T>(value: PropertyValue<T>): value is PropertyValue<NonNullable<T>> => {
    return !!unpackAccessor(value);
};
