import { CommandRequestBase, QueryRequestBase } from '.';

export type DontDisturbCommandRequest = CommandRequestBase & {
    notifications: {
        dontDisturb: boolean;
    };
};

export type DontDisturbCommandResponse = {
    notifications: {
        dontDisturb: boolean;
    }
};

export type DontDisturbQueryRequest = QueryRequestBase & {
    notifications: 'dontDisturb';
};

export type DontDisturbQueryResponse = {
    notifications: {
        dontDisturb: boolean;
    }
};

export type DismissAllNotificationsCommandRequest = CommandRequestBase & {
    notifications: 'dismissAllNotifications';
};
