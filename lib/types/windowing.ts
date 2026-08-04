import { Astal } from 'ags/gtk4';

export enum WindowType {
    NOTIFICATION = 'notification',
    ACTION_MODAL = 'action-modal',
    INPUT_MODAL = 'input-modal',
}

export type WindowId = string;

export type WindowOptions = {
    layer?: Astal.Layer;
    anchor?: Astal.WindowAnchor;
    position?: WindowPosition;
    closable?: boolean;
    noFrame?: boolean;
    keymode?: Astal.Keymode;
};

export type WindowCommandBase<T, P = undefined> = {
    type: T;
} & (
    P extends undefined ? object : {
        payload: P;
    }
);

export type WindowOpenCommandBase<T extends WindowType> = {
    id?: WindowId;
    type: T;
};

export type WindowCommandSuccessResult = {
    isSuccess: true;
};

export type WindowCommandErrorResult = {
    isSuccess: false;
    error?: unknown;
};

export type WindowCommandResult =
    | WindowCommandSuccessResult
    | WindowCommandErrorResult;

export type WindowPosition = {
    x: number;
    y: number;
};

export type WindowSize = {
    width: number;
    height: number;
};
