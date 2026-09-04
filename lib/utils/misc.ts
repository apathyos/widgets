import { Accessor, createComputed, createState, onCleanup } from 'gnim';
import { PropertyValue } from '../types/utils';
import { isAccessor } from './typeguards';
import { Position } from '../types/common';
import GLib from 'gi://GLib?version=2.0';
import { isEqual } from 'lodash';

export const getId = () => GLib.uuid_string_random();

export const toMap = <T, K>(values: T[], getKey: (value: T) => K) => new Map(values.map(v => [getKey(v), v]));

export const toAccessor = <T>(value: Accessor<T> | T) => {
    if (isAccessor(value)) {
        return value;
    }

    return new Accessor<T>(() => value);
};

export const updateAccessor = <T, R>(
    value: PropertyValue<T> | undefined,
    cb: (value: T | undefined, get: <V>(signal: PropertyValue<V>) => V) => R,
) => {
    return createComputed((get) => cb(get(toAccessor(value)), <V>(signal: PropertyValue<V>) => get(toAccessor(signal))));
};

export const unpackAccessor = <T>(value: PropertyValue<T>, reactive = false) => {
    if (value instanceof Accessor) {
        return reactive ? toAccessor(value)() : toAccessor(value).peek();
    }

    return value;
};

export const stableAccessor = <T, R = undefined>(value: PropertyValue<T>, opts?: {
    deep?: boolean;
    compose?: (value: T) => R;
}): R extends undefined ? PropertyValue<T> : PropertyValue<R> => {
    const { deep = true, compose = (value: T) => unpackAccessor(value) } = opts ?? {};

    const [prevValue, setPrevValue] = createState(unpackAccessor(value));
    const [result, setResult] = createState(compose(unpackAccessor(value)));

    const sub = toAccessor(value).subscribe(() => {
        const newValue = unpackAccessor(value);

        const composedPrevValue = compose(unpackAccessor(prevValue));
        const composedNewValue = compose(newValue);

        if (!deep ? composedPrevValue !== composedNewValue : !isEqual(composedPrevValue, composedNewValue)) {
            setPrevValue(newValue);
            setResult(composedNewValue);
        }
    });

    onCleanup(() => sub());

    return result as R extends undefined ? PropertyValue<T> : PropertyValue<R>;
};

export const insertToArray = <T, U>(
    arr: T[],
    items: U | U[],
    position: Position,
    indexOrCb: number | ((item: T) => boolean)
) => {
    const newArr: (T | U)[] = [];
    let targetIdx = typeof indexOrCb !== 'function' ? indexOrCb : -1;
    const isCb = typeof indexOrCb === 'function';
    const itemsToInsert = Array.isArray(items) ? items : [items];

    for (let i = 0; i < arr.length; i++) {
        const arrayItem = arr[i];

        if (isCb && indexOrCb(arrayItem)) {
            targetIdx = i;
        }

        if (targetIdx < 0) {
            continue;
        }

        if (i < targetIdx) {
            newArr.push(arrayItem);
            continue;
        }

        if (i === targetIdx) {
            if (position === Position.BEFORE) {
                newArr.push(...itemsToInsert, arrayItem);
            } else if (position === Position.AFTER) {
                newArr.push(arrayItem, ...itemsToInsert);
            }

            continue;
        }

        newArr.push(arrayItem);
    }

    return newArr;
};

export const getEnumKeyFromValue = (type: object, value: unknown) => {
    return Object.entries(type).find(([_, v]) => v === value)?.[0];
};

export const getUnpackedNumber = (value: unknown): number => {
    if (value instanceof GLib.Variant) {
        return Number(value.deepUnpack());
    }

    return Number(value);
};
