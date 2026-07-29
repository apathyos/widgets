import { Accessor, createState } from 'gnim';
import { WindowId } from '../../types/windowing';
import { Registry } from '../Registry';
import { AnyWindow } from '../../models/types/windowing';

export class WindowRegistry extends Registry<WindowId, AnyWindow> {
    readonly windows: Accessor<readonly AnyWindow[]>;
    private readonly setWindows: (models: readonly AnyWindow[]) => void;

    constructor() {
        super();

        [this.windows, this.setWindows] = createState<readonly AnyWindow[]>([]);
    }

    register(model: AnyWindow) {
        super.register(model);
        this.publish();
    }

    unregister(id: WindowId) {
        const model = super.unregister(id);
        this.publish();

        return model;
    }

    private publish() {
        const newWindows: AnyWindow[] = [];
        this.items.forEach(item => newWindows.push(item));

        setTimeout(() => this.setWindows(newWindows));
    }
}

export const WindowRegistryInstance = new WindowRegistry();
