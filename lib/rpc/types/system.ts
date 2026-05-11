import { CommandRequestBase } from '.';
import { IdleStatus, Output, Window, Workspace } from '../../types/system';

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
