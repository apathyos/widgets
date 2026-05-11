import { Request, RequestType } from '../types';
import { StatusPanelOpenedQueryRequest, StatusPanelOpenedQueryResponse } from '../types/statusPanel';

export const getIsStatusPanelOpenedQueryRequest = (request: Request): request is StatusPanelOpenedQueryRequest => {
    return request.type === RequestType.QUERY && 'statusPanel' in request && request.statusPanel === 'isOpened';
};

export const sendStatusPanelOpenedQueryResponse = (isOpened: boolean) => {
    const response: StatusPanelOpenedQueryResponse = { statusPanel: { isOpened } };
    return JSON.stringify(response);
};
