export enum Offset {
    XS = 2,
    S = 5,
    M = 10,
    L = 15,
    XL = 25
}

export enum Spacing {
    S = 5,
    M = 10,
    L = 15,
    XL = 25
}

export enum Size {
    XS = 8,
    S = 20,
    M = 50,
    L = 100,
    XL = 150,
    XXL = 200
}

export enum Transition {
    FAST = 200,
    FASTER = 300,
    NORMAL = 500,
    SLOWER = 700,
    SLOW = 1000
}

export enum Delay {
    ZERO = 0,
    XXS = 75,
    XS = 150,
    S = 250,
    M = 500,
    L = 1000,
    XL = 1500,
    XXL = 2000,
    XXXL = 2500,
}

export enum Level {
    ZERO = 'zero',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export enum Align {
    START = 'start',
    CENTER = 'center',
    END = 'end'
}

export enum Placement {
    TOP = 'top',
    LEFT = 'left',
    RIGHT = 'right',
    BOTTOM = 'bottom'
}

export enum Position {
    BEFORE,
    AFTER,
}

export enum Direction {
    FORWARD,
    BACKWARD,
    UPWARD,
    DOWNWARD,
}

export enum Axis {
    X = 'x',
    Y = 'y'
}

export type Margin = {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
};

export type ListItem<P = object, V = string> = {
    name: string;
    value: V;
    payload?: P;
};

export type Dispose = () => void;

export type Resolve<T = void> = (value: T) => void;
export type Reject<T = unknown> = (reason: T) => void;

export type Action<P = object, V = string> = ListItem<P, V> & {
    onAct: () => (void | Promise<void>);
};
