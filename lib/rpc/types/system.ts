import { CommandRequestBase } from '.';
import { IdleStatus, Output, SystemInhibitor, Window, Workspace } from '../../types/system';

export type IdleStatusCommandRequest = CommandRequestBase & {
    system: {
        idleStatus: IdleStatus;
    };
};

export type SetOutputsCommandRequest = CommandRequestBase & {
    system: {
        outputs: Output[];
    };
};

export type SetWorkspacesCommandRequest = CommandRequestBase & {
    system: {
        workspaces: Workspace[];
    };
};

export type SetWindowsCommandRequest = CommandRequestBase & {
    system: {
        windows: Window[];
    };
};

export type SetActiveSystemInhibitorsCommandRequest = CommandRequestBase & {
    system: {
        activeSystemInhibitors: SystemInhibitor[];
    }
};
