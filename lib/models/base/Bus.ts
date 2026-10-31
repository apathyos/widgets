import { BusCallMethodArgs } from '@/types/bus';
import Gio from 'gi://Gio?version=2.0';
import GLib from 'gi://GLib?version=2.0';

export class Bus<T extends Record<string, string>> {
    constructor(
        readonly connection: Gio.DBusConnection,
        readonly busName: string,
        readonly busPath: string,
        readonly busInterface: string,
    ) {}

    call<M extends string, R extends string, S extends boolean = false>(
        args: BusCallMethodArgs<M, T[M], R>,
        opts?: {
            sync?: S;
        }
    ): S extends true ? GLib.Variant<R> : Promise<GLib.Variant<R>> {
        const methodArgs = [
            this.busName,
            args.path ?? this.busPath,
            this.busInterface,
            args.method,
            args.parameters ?? null,
            args.replyType ?? null,
            args.flags ?? Gio.DBusCallFlags.NONE,
            args.timeout ?? -1,
            args.cancellable ?? null
        ] as const;

        const { sync } = opts ?? {};

        if (sync) {
            return this.connection.call_sync(...methodArgs) as S extends true ? GLib.Variant<R> : Promise<GLib.Variant<R>>;
        }

        return this.connection.call(...methodArgs) as S extends true ? GLib.Variant<R> : Promise<GLib.Variant<R>>;
    }
}
