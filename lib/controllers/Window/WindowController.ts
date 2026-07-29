import { WindowCommandResult, WindowType } from '../../types/windowing';
import { WindowCommand, WindowControllerContext } from '../../models/types/windowing';

export abstract class WindowController<T extends WindowType> {
    protected isDisposed = false;

    constructor(protected readonly context: WindowControllerContext<T>) {}

    async dispatch(command: WindowCommand[T]): Promise<WindowCommandResult> {
        const _cmd = command;

        if (this.isDisposed) {
            return { isSuccess: false };
        }

        return { isSuccess: true };
    }

    dispose() {
        this.isDisposed = true;
    }
}
