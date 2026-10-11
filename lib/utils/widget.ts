import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { Anchor, Element } from '../types/widget';
import { getMonitorForSurface, getWidgetMonitor, getWidgetSurface } from './display';
import GLib from 'gi://GLib?version=2.0';
import { Align, Margin, Placement } from '../types/common';
import Pango from 'gi://Pango?version=1.0';
import Graphene from 'gi://Graphene?version=1.0';

export const getWidgetAbsolutePosition = (widget: Gtk.Widget) => {
    const root = widget.get_root();
    const anchor = root && 'anchor' in root ? root.anchor as number : Anchor.TOP_LEFT;
    const monitor = getWidgetMonitor(widget);

    const position = { left: 0, top: 0, bottom: 0, right: 0 };

    if (!root) {
        return { top: 0, left: 0, bottom: 0, right: 0 };
    }

    const [_, point] = widget.compute_point(root, new Graphene.Point({ x: 0, y: 0 }));

    const left = point.x;
    const top = point.y;

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

    const rootAlloc = root.compute_bounds(root)[1];

    if (anchor === Anchor.TOP_RIGHT) {
        position.left += mgeo.width - rootAlloc.get_width();
    }

    return position;
};

export const trackWidgetSurfaceMonitorAttachment = (
    widget: Element,
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

    //@ts-expect-error wrong type inference
    widget.connect('realize', attach);
    //@ts-expect-error wrong type inference
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

export const getLimitedLayoutHeight = (args: {
    layout: Pango.Layout,
    maxLines: number,
}): number => {
    const { layout, maxLines } = args;

    if (maxLines <= 0) {
        return 0;
    }

    const iter = layout.get_iter();
    let index = 0;
    let firstTop: number | null = null;
    let lastVisibleBottom: number | null = null;

    do {
        const [ink] = iter.get_line_extents();

        if (!ink) {
            continue;
        }

        const [y0, y1] = iter.get_line_yrange();

        if (firstTop === null) {
            firstTop = Math.min(y0, ink.y);
        }

        const hasVisibleContent = ink.width !== 0 || ink.height !== 0;

        if (hasVisibleContent) {
            const inkBottom = ink.y + ink.height;
            lastVisibleBottom = Math.max(y1, inkBottom);
        }

        index++;

        if (index >= maxLines) {
            break;
        }
    } while (iter.next_line());

    if (firstTop === null || lastVisibleBottom === null) {
        return 0;
    }

    const topPx = Math.floor(firstTop / Pango.SCALE);
    const bottomPx = Math.ceil(lastVisibleBottom / Pango.SCALE);

    return Math.max(0, bottomPx - topPx);
};

export const getWidgetAnchoredPosition = (args: {
    anchor: Element;
    widget: Element;
    placement?: Placement;
    alignment?: Align;
    offset?: number;
}) => {
    const {
        anchor,
        widget,
        placement = Placement.BOTTOM,
        alignment = Align.CENTER,
        offset = 0
    } = args;

    const { top, left } = getWidgetAbsolutePosition(anchor);
    const anchorBounds = anchor.compute_bounds(anchor)[1];
    const widgetBounds = widget.compute_bounds(widget)[1];

    const anchorGeometry = { width: anchorBounds.get_width(), height: anchorBounds.get_height() };
    const widgetGeometry = { width: widgetBounds.get_width(), height: widgetBounds.get_height() };

    let widgetTop = top;
    let widgetLeft = left;

    if (placement === Placement.TOP) {
        widgetTop = top - widgetGeometry.height - offset;
    } else if (placement === Placement.BOTTOM) {
        widgetTop = top + anchorGeometry.height + offset;
    } else if (placement === Placement.LEFT) {
        widgetLeft = left - widgetGeometry.width - offset;
    } else if (placement === Placement.RIGHT) {
        widgetLeft = left + anchorGeometry.width + offset;
    }

    if (placement === Placement.TOP || placement === Placement.BOTTOM) {
        if (alignment === Align.START) {
            widgetLeft = left;
        } else if (alignment === Align.END) {
            widgetLeft = left + anchorGeometry.width;
        } else {
            widgetLeft = left - Math.abs(widgetGeometry.width - anchorGeometry.width) / 2;
        }
    } else {
        if (alignment === Align.START) {
            widgetTop = top;
        } else if (alignment === Align.END) {
            widgetTop = top + anchorGeometry.height;
        } else {
            widgetTop = top - Math.abs(widgetGeometry.height - anchorGeometry.height) / 2;
        }
    }

    return { top: widgetTop, left: widgetLeft };
};
