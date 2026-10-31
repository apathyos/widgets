import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';

export enum DBusMethod {
    ErrorUnknownMethod = 'org.freedesktop.DBus.Error.UnknownMethod'
}

export type BusCallMethodArgs<M, P extends string, R extends string> = {
    method: M;
    path?: string;
    replyType?: GLib.VariantType<R> | null;
    flags?: Gio.DBusCallFlags;
    timeout?: number;
    cancellable?: Gio.Cancellable | null;
} & (P extends '' ? { parameters?: null; } : { parameters: GLib.Variant<P>; });
