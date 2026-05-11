import { Gdk } from 'ags/gtk4';
import { Title } from '../../shared';
import { createComputed, createEffect, createState, onCleanup } from 'gnim';
import { Windows } from '../../models/Windows';
import { IpcSocket } from '../../models/IpcSocket';
import { handleEvent } from '../../ipc/utils';
import { getIsWindowsChangedIpcEvent } from '../../ipc';
import { Window } from '../../types/system';

export interface IActiveWindowTitle {
    monitor: Gdk.Monitor;
}

const ipcSocket = new IpcSocket();

export function ActiveWindowTitle(props: IActiveWindowTitle) {
    const { monitor } = props;

    const windows = new Windows();

    const [windowsList, setWindowsList] = createState<Window[]>([]);

    createEffect(async () => {
        setWindowsList(await windows.getWindowsInfo());
    });

    const windowsListenerDispose = ipcSocket.listen(handleEvent(getIsWindowsChangedIpcEvent, async (payload) => {
        setWindowsList(await windows.getWindowsInfo({ state: payload }));
    }));

    const windowTitle = createComputed(get => {
        return get(windowsList).find(w => w.activated && w.outputs.includes(monitor.get_connector() ?? ''))?.title ?? '';
    });

    onCleanup(() => {
        windowsListenerDispose();
    });

    return <Title label={windowTitle} maxWidth={75} />;
}
