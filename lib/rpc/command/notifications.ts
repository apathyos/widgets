import { Request, RequestType } from '../types';
import {
    DismissAllNotificationsCommandRequest,
    DontDisturbCommandRequest,
    DontDisturbCommandResponse
} from '../types/notifications';

export const getIsDontDisturbCommandRequest = (request: Request): request is DontDisturbCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'notifications' in request &&
        typeof request.notifications === 'object' &&
        'dontDisturb' in request.notifications &&
        typeof request.notifications.dontDisturb === 'boolean'
    );
};

export const getDontDisturbCommandRequest = (dontDisturb: boolean) => {
    const request: DontDisturbCommandRequest = {
        type: RequestType.COMMAND,
        notifications: { dontDisturb }
    };

    return request;
};

export const getDontDisturbCommandResponse = (dontDisturb: boolean) => {
    const response: DontDisturbCommandResponse = { notifications: { dontDisturb } };
    return JSON.stringify(response);
};

export const getIsDismissAllNotificationsCommandRequest = (
    request: Request
): request is DismissAllNotificationsCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'notifications' in request &&
        request.notifications === 'dismissAllNotifications'
    );
};
