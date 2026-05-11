import { CommandRequestBase, QueryRequestBase } from '.';

export type SetStatusPanelIsOpenedCommandRequest = CommandRequestBase & {
    statusPanel: {
        isOpened: boolean;
        instant?: boolean;
    };
};

export type ToggleStatusPanelCommandRequest = CommandRequestBase & {
    statusPanel: 'toggleOpened';
};

export type StatusPanelOpenedQueryRequest = QueryRequestBase & {
    statusPanel: 'isOpened';
};

export type StatusPanelOpenedQueryResponse = {
    statusPanel: {
        isOpened: boolean;
    };
};
