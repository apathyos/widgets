import { Accessor } from 'gnim';

export type PropertyValue<T> = T | Accessor<T>;

export type Classes<T extends string> = {
    [K in T]?: PropertyValue<string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Children = any;

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
    [K in keyof T]: Accessor<NonNullable<T[K]>>;
} : Accessor<T>;

export type Primitive = string | number | boolean | null;

export type AnyFunction =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ((...args: any[]) => unknown)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | (abstract new (...args: any[]) => object);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : T extends { toJSON(...args: any[]): infer Result }
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
