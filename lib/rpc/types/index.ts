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

export enum RequestType {
    COMMAND = 'COMMAND',
    QUERY = 'QUERY',
}

export type CommandRequestBase = {
    type: RequestType.COMMAND;
    shouldNotify?: boolean;
};

export type QueryRequestBase = {
    type: RequestType.QUERY;
};

export type RequestOptions<T> = {
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
