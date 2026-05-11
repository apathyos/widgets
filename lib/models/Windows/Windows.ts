import { execAsync } from 'ags/process';
import { WindowInfoState } from '../../types/ipc';
import { IPC } from '../../constants/os';
import { Window } from '../../types/system';

export class Windows {
    async getWindowsInfo(args?: {
        state?: WindowInfoState[];
        filterByOutput?: string;
    }) {
        const { state, filterByOutput } = args ?? {};

        try {
            let windowsInfo: WindowInfoState[] = state ?? JSON.parse(await execAsync(['sh', '-c', `${IPC} windows`]));

            if (filterByOutput) {
                windowsInfo = windowsInfo.filter(w => w.outputs.includes(filterByOutput));
            }

            return windowsInfo.map(Windows.getWindowInfoFromState);
        } catch (e) {
            console.error("Couldn't retrieve outputs info: ", e);
        }

        return [];
    }

    static getWindowInfoFromState(window: WindowInfoState): Window {
        return {
            id: window.id,
            appId: window.app_id,
            parentId: window.parent_id,
            title: window.title,
            activated: window.is_activated,
            fullscreen: window.is_fullscreen,
            maximized: window.is_maximized,
            minimized: window.is_minimized,
            outputs: window.outputs,
            workspaces: window.workspaces
        };
    }
}
