import { DismissAllNotificationsCommandRequest, DontDisturbCommandRequest, DontDisturbQueryRequest } from './notifications';
import {
    SetStatusPanelIsOpenedCommandRequest,
    StatusPanelOpenedQueryRequest,
    ToggleStatusPanelCommandRequest
} from './statusPanel';
import {
    IdleStatusCommandRequest,
    SetOutputsCommandRequest,
    SetWindowsCommandRequest,
    SetWorkspacesCommandRequest
} from './system';
import { KeyboardLayoutCommandRequest } from './input';
import { ModuleId } from '../../types/app';

export enum RequestType {
    COMMAND = 'COMMAND',
    QUERY = 'QUERY',
}

export type CommandRequestBase = {
    id?: ModuleId;
    type: RequestType.COMMAND;
};

export type QueryRequestBase = {
    id?: ModuleId;
    type: RequestType.QUERY;
};

export type RequestOptions<T> = {
    id?: ModuleId;
    modifyRequest?: (request: string[]) => string;
    respondWith?: string | ((request: T | null) => string);
};

export type Request =
    | SetStatusPanelIsOpenedCommandRequest
    | ToggleStatusPanelCommandRequest
    | StatusPanelOpenedQueryRequest
    | IdleStatusCommandRequest
    | SetOutputsCommandRequest
    | SetWorkspacesCommandRequest
    | SetWindowsCommandRequest
    | DontDisturbCommandRequest
    | DontDisturbQueryRequest
    | DismissAllNotificationsCommandRequest
    | KeyboardLayoutCommandRequest;
