import { Accessor } from 'gnim';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

export type PropertyValue<T> = T | Accessor<T>;

export type Classes<T extends string> = {
    [K in T]?: PropertyValue<string>;
};

export type Children = Any;

export type DeepPartial<T extends object> = {
    [K in keyof T]?: Required<T>[K] extends object ? DeepPartial<Required<T>[K]> : T[K] | undefined;
};

export type PartiallyDefined<T, V extends keyof T = keyof T, E extends keyof T = never> = {
    [K in keyof Required<T>]: K extends E ? T[K] : K extends V ? Required<T>[K] | undefined : T[K];
};

export type PartialSome<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredSome<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type DistributiveOmit <T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type UnpackAccessor<T> = T extends Accessor<infer R> ? R : T;
export type UnpackAccessorProps<T extends object, P extends keyof T> = {
    [K in keyof T]: K extends P ? UnpackAccessor<T[K]> : never;
};

export type Reactive<T> = T extends object ? {
    [K in keyof T]: PropertyValue<NonNullable<T[K]>>;
} : PropertyValue<T>;

export type ReactiveSome<T extends object, K extends keyof T> = {
    [P in keyof T]: P extends K ? PropertyValue<NonNullable<T[P]>> : T[P];
};

export type ReactiveExcept<T extends object, K extends keyof T> = {
    [P in keyof T]: P extends K ? T[P] : PropertyValue<NonNullable<T[P]>>;
};

export type Primitive = string | number | boolean | null;

export type AnyFunction =
    | ((...args: Any[]) => unknown)
    | (abstract new (...args: Any[]) => object);

export type UnSerializable =
    | undefined
    | bigint
    | symbol
    | AnyFunction;

export type IsAny<T> = 0 extends 1 & T ? true : false;

type SerializableArray<T extends readonly unknown[]> = {
    [K in keyof T]:
        Serializable<T[K]> extends never
            ? null
            : Serializable<T[K]>;
};

type SerializableObject<T extends object> = {
    [K in keyof T as K extends string | number
        ? Serializable<T[K]> extends never
            ? never
            : K
        : never
    ]: Serializable<T[K]>;
};

export type Serializable<T> =
    IsAny<T> extends true
        ? never
        : T extends { toJSON(...args: Any[]): infer Result }
            ? Serializable<Result>
            : T extends Primitive
                ? T
                : T extends UnSerializable
                    ? never
                    : T extends readonly unknown[]
                        ? SerializableArray<T>
                        : T extends object
                            ? SerializableObject<T>
                            : never;
