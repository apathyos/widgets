import { Accessor } from 'gnim';

export type PropertyValue<T> = T | Accessor<T>;

export type Classes<T extends string> = {
    [K in T]?: PropertyValue<string>;
};

export type Children = any;

export type DeepPartial<T extends object> = {
    [K in keyof T]?: Required<T>[K] extends object ? DeepPartial<Required<T>[K]> : T[K] | undefined;
};

export type PartiallyDefined<T, V extends keyof T = keyof T, E extends keyof T = never> = {
    [K in keyof Required<T>]: K extends E ? T[K] : K extends V ? Required<T>[K] | undefined : T[K];
};

export type PartialSome<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredSome<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type UnpackAcessor<T> = T extends Accessor<infer R> ? R : T;
