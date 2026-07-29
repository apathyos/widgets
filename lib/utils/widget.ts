import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { Anchor, Element } from '../types/widget';
import { getMonitorForSurface, getWidgetMonitor, getWidgetSurface } from './display';
import GLib from 'gi://GLib?version=2.0';
import { Margin } from '../types/common';

export const getWidgetAbsolutePosition = (widget: Gtk.Widget) => {
    const root = widget.get_root();
    const anchor = root && 'anchor' in root ? root.anchor as number : Anchor.TOP_LEFT;
    const monitor = getWidgetMonitor(widget);

    const position = { left: 0, top: 0, bottom: 0, right: 0 };

    if (!root) {
        return { top: 0, left: 0, bottom: 0, right: 0 };
    }

    const [_, left, top] = widget.translate_coordinates(root, 0, 0);

    if (!monitor) {
        return position;
    }

    const mgeo = monitor.get_geometry();

    position.left = left + root.margin_start;
    position.top = top + root.margin_top;
    position.bottom = mgeo.height - top;
    position.right = mgeo.width - left;

    if (anchor === Anchor.TOP_LEFT) {
        position.left += left;
        position.top += top;

        return position;
    }

    const rootAlloc = root.get_allocation();

    if (anchor === Anchor.TOP_RIGHT) {
        position.left += mgeo.width - rootAlloc.width;
    }

    return position;
};

export const trackWidgetSurfaceMonitorAttachment = (
    widget: Gtk.Widget | Astal.Window,
    onAttach: (monitor: Gdk.Monitor) => void
) => {
    let surface: Gdk.Surface | null | undefined = null;
    let handlers: [Gdk.Surface, number][] = [];

    function detach() {
        if (!surface) {
            return;
        }

        for (const [obj, id] of handlers) {
            obj.disconnect(id);
        }

        handlers = [];
        surface = null;
    }

    function attach() {
        detach();

        surface = getWidgetSurface(widget);

        if (!surface) {
            return;
        }

        const recompute = () => {
            if (!surface) {
                return GLib.SOURCE_REMOVE;
            }

            const monitor = getMonitorForSurface(surface);

            if (monitor) {
                onAttach(monitor);
            }

            return GLib.SOURCE_REMOVE;
        };

        handlers.push([
            surface,
            surface.connect('enter-monitor', () => GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, recompute))
        ]);

        handlers.push([
            surface,
            surface.connect('leave-monitor', () => GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, recompute))
        ]);

        handlers.push([
            surface,
            surface.connect('layout', () => GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, recompute))
        ]);

        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, recompute);
    }

    widget.connect('realize', attach);
    widget.connect('unrealize', detach);

    if (getWidgetSurface(widget)) {
        attach();
    }
};

export const getHasAnchorSide = (args: {
    anchor: Astal.WindowAnchor;
    side: Astal.WindowAnchor;
}) => {
    const { anchor, side } = args;

    return (anchor & side) === side;
};

export const getCenterPositionForWidget = (args: {
    ref: Element;
    monitor: Gdk.Monitor;
    anchor: Astal.WindowAnchor;
}) => {
    const { ref, monitor, anchor } = args;

    const alloc = ref.get_allocation();
    const mgeo = monitor.get_geometry();

    const yShift = mgeo.height * 0.05;

    return {
        top: mgeo.height / 2 - alloc.height / 2 - (
            getHasAnchorSide({ anchor, side: Astal.WindowAnchor.BOTTOM })
                ? -yShift
                : yShift
        ),
        left: mgeo.width / 2 - alloc.width / 2
    };
};

export const getElementMarginPositionForAnchor = (args: {
    position: { x: number; y: number };
    anchor: Astal.WindowAnchor;
}): Margin => {
    const { position: { x, y }, anchor } = args;

    if (
        getHasAnchorSide({ anchor, side: Astal.WindowAnchor.TOP })
        && getHasAnchorSide({ anchor, side: Astal.WindowAnchor.RIGHT })
    ) {
        return { top: y, right: x };
    }

    if (
        getHasAnchorSide({ anchor, side: Astal.WindowAnchor.BOTTOM })
        && getHasAnchorSide({ anchor, side: Astal.WindowAnchor.LEFT })
    ) {
        return { left: x, bottom: y };
    }

    if (
        getHasAnchorSide({ anchor, side: Astal.WindowAnchor.BOTTOM })
        && getHasAnchorSide({ anchor, side: Astal.WindowAnchor.RIGHT })
    ) {
        return { bottom: y, right: x };
    }

    return { top: y, left: x };
};

export const getElementMarginPropertyName = (element: Element, property: keyof Margin) => {
    if (property === 'bottom') {
        return 'marginBottom';
    }

    if (property === 'left') {
        return element instanceof Astal.Window ? 'marginLeft' : 'marginStart';
    }

    if (property === 'right') {
        return element instanceof Astal.Window ? 'marginRight' : 'marginEnd';
    }

    return 'marginTop';
};

export const setElementMarginProperty = (
    element: Element,
    prop: keyof Margin,
    value: number | undefined | null
) => {
    if (typeof value !== 'number') {
        return;
    }

    //@ts-expect-error need a more accurate way to determine correct type here
    element[getElementMarginPropertyName(element, prop)] = value;
};

export const setElementMargin = (element: Element, margin: Margin) => {
    for (const prop in margin) {
        const p = prop as keyof Margin;

        setElementMarginProperty(element, p, margin[p]);
    }
};

export const setElementMarginPositionForAnchor = (args: {
    element: Element;
    position: { x: number; y: number };
    anchor: Astal.WindowAnchor;
}) => {
    const { element, position, anchor } = args;

    const margin = getElementMarginPositionForAnchor({ position, anchor });
    setElementMargin(element, margin);
};

export const getElementDragDelta = (args: {
    anchor: Astal.WindowAnchor;
    delta: { x: number; y: number };
}) => {
    const { anchor, delta } = args;

    let x = delta.x;
    let y = delta.y;

    if (getHasAnchorSide({ anchor, side: Astal.WindowAnchor.RIGHT })) {
        x = -x;
    }

    if (getHasAnchorSide({ anchor, side: Astal.WindowAnchor.BOTTOM })) {
        y = -y;
    }

    return { x, y };
};
