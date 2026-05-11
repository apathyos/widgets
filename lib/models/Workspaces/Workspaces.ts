import { execAsync } from 'ags/process';
import { WorkspaceInfoState } from '../../types/ipc';
import { IPC } from '../../constants/os';
import { Workspace } from '../../types/system';

export class Workspaces {
    async getWorkspacesInfo(args?: {
        state?: WorkspaceInfoState[];
        sort?: boolean;
        filterByOutput?: string;
    }) {
        const { state, sort = true, filterByOutput } = args ?? {};

        try {
            let workspacesInfo: WorkspaceInfoState[] = state ?? JSON.parse(await execAsync(['sh', '-c', `${IPC} workspaces`]));

            if (sort) {
                workspacesInfo = workspacesInfo.sort((a, b) => String(a.name).localeCompare(String(b.name)));
            }

            if (filterByOutput) {
                workspacesInfo = workspacesInfo.filter(w => w.output ? w.output === filterByOutput : true);
            }

            return workspacesInfo.map(Workspaces.getWorkspaceInfoFromState);
        } catch (e) {
            console.error("Couldn't retrieve outputs info: ", e);
        }

        return [];
    }

    static getWorkspaceInfoFromState(workspace: WorkspaceInfoState): Workspace {
        return {
            id: workspace.id ?? -1,
            name: workspace.name,
            windows: 1,
            output: '',
            focused: workspace.is_active,
            occupied: true,
            urgent: workspace.is_urgent,
        };
    }
}
