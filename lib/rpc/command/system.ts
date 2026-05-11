import { Output, Window, Workspace } from '../../types/system';
import { Request, RequestType } from '../types';
import {
    IdleStatusCommandRequest,
    SetOutputsCommandRequest,
    SetWindowsCommandRequest,
    SetWorkspacesCommandRequest
} from '../types/system';

export const getIsIdleStatusCommandRequest = (request: Request): request is IdleStatusCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'system' in request &&
        'idleStatus' in request.system && request.system.idleStatus
    );
};

export const getIsSetOutputsCommandRequest = (request: Request): request is SetOutputsCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'system' in request &&
        'outputs' in request.system && request.system.outputs
    );
};

export const getSetOutputsCommandRequest = (outputs: Output[]) => {
    const request: SetOutputsCommandRequest = {
        type: RequestType.COMMAND,
        system: { outputs }
    };

    return request;
};

export const getIsSetWorkspacesCommandRequest = (request: Request): request is SetWorkspacesCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'system' in request &&
        'workspaces' in request.system && request.system.workspaces
    );
};

export const getSetWorkspacesCommandRequest = (workspaces: Workspace[]) => {
    const request: SetWorkspacesCommandRequest = {
        type: RequestType.COMMAND,
        system: { workspaces }
    };

    return request;
};

export const getIsSetWindowsCommandRequest = (request: Request): request is SetWindowsCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'system' in request &&
        'windows' in request.system && request.system.windows
    );
};

export const getSetWindowsCommandRequest = (windows: Window[]) => {
    const request: SetWindowsCommandRequest = {
        type: RequestType.COMMAND,
        system: { windows }
    };

    return request;
};
