import { Astal, Gdk, Gtk } from 'ags/gtk4';

export const getWidgetSurface = (widget: Gtk.Widget | Astal.Window) => {
    const root = widget.get_root();
    return root?.get_surface?.();
};

export const getMonitorForSurface = (surface: Gdk.Surface) => {
    const display = Gdk.Display.get_default();
    return display?.get_monitor_at_surface(surface);
};

export const getWidgetMonitor = (widget: Gtk.Widget | Astal.Window) => {
    const surface = getWidgetSurface(widget);
    return surface ? getMonitorForSurface(surface) : null;
};
