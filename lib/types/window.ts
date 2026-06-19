import { Accessor } from 'gnim';

export type WindowMargin = {
    top?: number | Accessor<number>;
    left?: number | Accessor<number>;
    right?: number | Accessor<number>;
    bottom?: number | Accessor<number>;
};
