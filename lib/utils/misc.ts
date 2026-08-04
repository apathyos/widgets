import { Accessor, createComputed } from 'gnim';
import { PropertyValue } from '../types/utils';
import { isAccessor } from './typeguards';
import { Position } from '../types/common';
import GLib from 'gi://GLib?version=2.0';

export const getId = () => GLib.uuid_string_random();

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

export const unpackAccessor = <T>(value: PropertyValue<T>) => {
    if (value instanceof Accessor) {
        return toAccessor(value).peek();
    }

    return value;
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

export const getStringList = <T>(arr: T[], cb: (item: T) => string) => {
    return arr.reduce((acc, item, idx) => {
        return acc + (idx > 0 ? ', ' : '') + cb(item);
    }, '');
};

export const getEnumKeyFromValue = (type: object, value: unknown) => {
    return Object.entries(type).find(([_, v]) => v === value)?.[0];
};

export const getStringFromBytes = (bytes: GLib.Bytes) => {
    const data = bytes.get_data();

    if (!data || !data.length) {
        return '';
    }

    return new TextDecoder('utf-8').decode(data);
};

export const getUnpackedNumber = (value: unknown): number => {
    if (value instanceof GLib.Variant) {
        return Number(value.deepUnpack());
    }

    return Number(value);
};
