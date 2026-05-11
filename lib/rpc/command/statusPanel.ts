import { Request, RequestType } from '../types';
import { SetStatusPanelIsOpenedCommandRequest, ToggleStatusPanelCommandRequest } from '../types/statusPanel';

export const getIsSetStatusPanelOpenedCommandRequest = (
    request: Request,
): request is SetStatusPanelIsOpenedCommandRequest => {
    return (
        request.type === RequestType.COMMAND &&
        'statusPanel' in request &&
        request.statusPanel &&
        typeof request.statusPanel === 'object' &&
        'isOpened' in request.statusPanel &&
        typeof request.statusPanel.isOpened === 'boolean'
    );
};

export const getIsToggleStatusPanelCommandRequest = (request: Request): request is ToggleStatusPanelCommandRequest => {
    return request.type === RequestType.COMMAND && 'statusPanel' in request && request.statusPanel === 'toggleOpened';
};
