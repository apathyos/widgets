import { Accessor, createState } from 'gnim';
import { WindowController } from '../../controllers/Window';
import { WindowId, WindowPosition, WindowType } from '../../types/windowing';
import { WindowDescriptor } from '../types/windowing';

export class Window<T extends WindowType> {
    readonly id: WindowId;
    readonly type: T;

    readonly descriptor: WindowDescriptor<T>;
    readonly controller: WindowController<T>;

    readonly title: Accessor<string>;
    readonly position: Accessor<WindowPosition>;

    private readonly setWindowTitle: (title: string) => void;
    private readonly setWindowPosition: (position: WindowPosition) => void;

    constructor(descriptor: WindowDescriptor<T>, controller: WindowController<T>) {
        this.id = descriptor.id;
        this.type = descriptor.type;
        this.descriptor = descriptor;
        this.controller = controller;

        [this.title, this.setWindowTitle] = createState(descriptor.title ?? 'Window');
        [this.position, this.setWindowPosition] = createState(descriptor.options?.position ?? { x: 0, y: 0 });
    }

    setTitle(title: string) {
        this.setWindowTitle(title);
    }

    setPosition(position: WindowPosition) {
        this.setWindowPosition(position);
    }

    dispose() {
        this.controller.dispose();
    }
}
