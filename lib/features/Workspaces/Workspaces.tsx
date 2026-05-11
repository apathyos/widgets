import { execAsync } from 'ags/process';
import { createEffect, createState, For, onCleanup } from 'gnim';
import { Gdk } from 'ags/gtk4';
import { Workspaces } from '../../models/Workspaces';
import cn from 'classnames';
import { SymbolButton } from '../../shared';
import { updateAccessor } from '../../utils/misc';
import { IpcSocket } from '../../models/IpcSocket';
import { handleEvent } from '../../ipc/utils';
import { getIsWorkspacesChangedIpcEvent } from '../../ipc';
import { Workspace } from '../../types/system';

export interface IWorkspaces {
    monitor: Gdk.Monitor;
    classes?: {
        root?: string;
        workspace?: string;
    };
}

const ipcSocket = new IpcSocket();

export function Worskpaces(props: IWorkspaces) {
    const { monitor, classes } = props;

    const workspaces = new Workspaces();

    const [workspacesList, setWorkspacesList] = createState<Workspace[]>([]);

    createEffect(async () => {
        setWorkspacesList(await workspaces.getWorkspacesInfo());
    });

    const wsListenerDispose = ipcSocket.listen(handleEvent(getIsWorkspacesChangedIpcEvent, async (payload) => {
        setWorkspacesList(await workspaces.getWorkspacesInfo({ state: payload.filter(
            (w) => w.output ? w.output === monitor.get_connector() : true
        ) }));
    }));

    onCleanup(() => {
        wsListenerDispose();
    });

    return (
        <box class={updateAccessor(classes?.root, root => cn(root, 'workspaces'))}>
            <For each={workspacesList}>
                {(item) => {
                    return (
                        <SymbolButton
                            onClick={() =>
                                execAsync(['sh', '-c', `$_APTH_WM_BIN/statusbar/change_active_workspace ${item.id}`])
                            }
                            classes={{
                                root: cn(
                                    classes?.workspace,
                                    'workspaces__workspace',
                                    !item.windows && 'workspaces__workspace_empty',
                                    item.focused && 'workspaces__workspace_focused',
                                    item.occupied && 'workspaces__workspace_occupied',
                                ),
                            }}
                        >
                            {item.focused ? '' : ''}
                        </SymbolButton>
                    );
                }}
            </For>
        </box>
    );
}
