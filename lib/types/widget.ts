import { Astal, Gtk } from 'ags/gtk4';

export enum WidgetVariant {
    PRIMARY,
    ALT,
}

export enum MouseButton {
    LEFT = 1,
    RIGHT = 3,
    MIDDLE = 2,
}

export enum Anchor {
    TOP_LEFT = Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT,
    TOP_RIGHT = Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
    BOTTOM_LEFT = Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT,
    BOTTOM_RIGHT = Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT
}

export enum IconSize {
    XS = 16,
    S = 24,
    M = 32,
    L = 48,
    XL = 64
}

export type Element = Gtk.Widget | Astal.Window;

export type Component<P extends object> = (props: P) => JSX.Element;

export type TransitionOptions = {
    enabled?: boolean;
    type?: Gtk.RevealerTransitionType;
    duration?: number;
};

export type ElementInfoText = {
    isPresent: boolean;
    text?: string;
};
