import { IpcEvent } from '../../types/ipc';

export const handleEvent = <T extends IpcEvent>(
    test: (event: IpcEvent) => event is T,
    task: (payload: T['payload']) => Promise<void> | void,
) => (event: IpcEvent | null) => {
    if (!event || !test(event)) {
        return;
    }

    task(event.payload);
};
