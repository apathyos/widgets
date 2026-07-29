import { WindowController } from '../../controllers/Window';
import { Window } from '../../models/Window';
import { WindowRegistry } from '../../registry/WindowRegistry';
import {
    WindowId,
    WindowType,
    WindowCommandResult
} from '../../types/windowing';
import {
    AnyWindow,
    WindowCommand,
    WindowControllerContext,
    WindowDescriptor,
    WindowDone,
    WindowOpenCommand,
    WindowProxy,
    WindowProxySignal
} from '../../models/types/windowing';
import { getId } from '../../utils/misc';
import { Resolve } from '../../types/common';

export class WindowService {
    private handles = new Map<WindowId, { done: WindowDone; resolve: Resolve }>();
    private signals = new Map<WindowId, WindowProxySignal<WindowType>[]>();

    constructor(readonly registry: WindowRegistry) {}

    open<T extends WindowType>(
        command: WindowOpenCommand<T>,
        createController: (context: WindowControllerContext<T>) => WindowController<T>
    ): WindowProxy<T> {
        const { id = getId(), type, title, options, props } = command;

        const model = this.registry.resolve(id);

        if (model) {
            return this.createWindowProxy(id, type);
        }

        const descriptor: WindowDescriptor<T> = {
            id,
            type,
            title,
            options,
            props,
        };

        const controller = createController(this.createWindowContext(id, type));

        this.registry.register(new Window(descriptor, controller) as AnyWindow);

        let resolve: Resolve | null = null;
        const done: WindowDone = new Promise(res => { resolve = res; });
        this.handles.set(id, { done, resolve: resolve! });

        return this.createWindowProxy<T>(id, type);
    }

    async close(id: WindowId): Promise<WindowCommandResult> {
        const model = this.registry.resolve(id);

        if (!model) {
            return { isSuccess: true };
        }

        const removed = this.registry.unregister(id);
        removed?.dispose();
        this.signals.delete(id);

        this.handles.get(id)?.resolve();
        this.handles.delete(id);

        return { isSuccess: true };
    }

    async send<T extends WindowType>(id: WindowId, type: T, command: WindowCommand[T]): Promise<WindowCommandResult> {
        const model = this.registry.resolve(id);

        if (!model) {
            return { isSuccess: false };
        }

        if (model?.type !== type) {
            return { isSuccess: false };
        }

        const result = await (model.controller as WindowController<T>).dispatch(command);
        this.signals.get(id)?.forEach(signal => signal(command, result));

        return result;
    }

    createWindowContext<T extends WindowType>(id: WindowId, type: T): WindowControllerContext<T> {
        const proxy: WindowControllerContext<T> = {
            self: {
                id,
                type,
                close: () => this.close(id)
            }
        };

        return proxy;
    }

    createWindowProxy<T extends WindowType>(id: WindowId, type: T): WindowProxy<T> {
        const done = this.handles.get(id)?.done;

        if (!done) {
            throw new Error(`There is no handle for window ${id}. Is the window opened?`);
        }

        const proxy: WindowProxy<T> = {
            id,
            type,
            done,
            send: (command) => this.send(id, type, command),
            close: () => this.close(id),
            signal: (cb) => {
                this.signals.set(id, (this.signals.get(id) ?? []).concat(cb as WindowProxySignal<WindowType>));

                return () => {
                    this.signals.set(id, this.signals.get(id)?.filter(signal => signal !== cb) ?? []);
                };
            },
        };

        return proxy;
    }
}
