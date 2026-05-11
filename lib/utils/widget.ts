import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { Anchor } from '../types/widget';
import { getMonitorForSurface, getWidgetMonitor, getWidgetSurface } from './display';
import GLib from 'gi://GLib?version=2.0';

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
