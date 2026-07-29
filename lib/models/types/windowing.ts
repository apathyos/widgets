import { Dispose } from '../../types/common';
import { WindowCommandResult, WindowOptions } from '../../types/windowing';
import { WindowId, WindowType } from '../../types/windowing';
import {
    ActionModalWindowCommand,
    ActionModalWindowOpenCommandProps,
    InputModalWindowCommand,
    InputModalWindowOpenCommandProps
} from '../Modal/types/windowing';
import { NotificationWindowCommand, NotificationWindowOpenCommandProps } from '../Notification/types/windowing';
import { Window } from '../Window';

export type AnyWindow = {
    [T in WindowType]: Window<T>;
}[WindowType];

export type WindowCommand = {
    [WindowType.NOTIFICATION]: NotificationWindowCommand;
    [WindowType.ACTION_MODAL]: ActionModalWindowCommand;
    [WindowType.INPUT_MODAL]: InputModalWindowCommand;
};

export type WindowOpenCommandProps = {
    [WindowType.NOTIFICATION]: NotificationWindowOpenCommandProps;
    [WindowType.ACTION_MODAL]: ActionModalWindowOpenCommandProps;
    [WindowType.INPUT_MODAL]: InputModalWindowOpenCommandProps;
};

export type WindowOpenCommand<T extends WindowType> = {
    id?: WindowId;
    type: T;
    title?: string;
    options?: WindowOptions;
    props: WindowOpenCommandProps[T];
};

export type WindowDescriptor<T extends WindowType> = {
    id: string;
    type: T;
    title?: string;
    options?: WindowOptions;
    props: WindowOpenCommandProps[T];
};

export type WindowDone = Promise<void>;

export type WindowProxySignal<T extends WindowType> = (
    command: WindowCommand[T],
    result: WindowCommandResult
) => void;

export type WindowProxy<T extends WindowType> = {
    id: string;
    type: T;
    done: WindowDone;
    send: (command: WindowCommand[T]) => Promise<WindowCommandResult>;
    close: () => Promise<WindowCommandResult>;
    signal: (cb: WindowProxySignal<T>) => Dispose;
};

export type WindowSelfContext<T extends WindowType> = {
    readonly id: WindowId;
    readonly type: T;

    close(): Promise<WindowCommandResult>;
};

export type WindowControllerContext<T extends WindowType> = {
    readonly self: WindowSelfContext<T>;
};
