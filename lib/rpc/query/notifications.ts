import { Request, RequestType } from '../types';
import { DontDisturbQueryRequest, DontDisturbQueryResponse } from '../types/notifications';

export const getIsDontDisturbQueryRequest = (request: Request): request is DontDisturbQueryRequest => {
    return !!(request.type === RequestType.QUERY && 'notifications' in request && request.notifications === 'dontDisturb');
};

export const getDontDisturbQueryRequest = () => {
    const request: DontDisturbQueryRequest = {
        type: RequestType.QUERY,
        notifications: 'dontDisturb'
    };

    return request;
};

export const getDontDisturbQueryResponse = (dontDisturb: boolean) => {
    const response: DontDisturbQueryResponse = { notifications: { dontDisturb } };
    return JSON.stringify(response);
};
