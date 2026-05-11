import {
    IpcEvent,
    IpcEventKeyboardLayoutChanged,
    IpcEventOutputsChanged,
    IpcEventType,
    IpcEventWindowsChanged,
    IpcEventWorkspacesChanged
} from '../../types/ipc';

export const getIsKeyboardLayoutChangedIpcEvent = (event: IpcEvent): event is IpcEventKeyboardLayoutChanged => {
    return event.type === IpcEventType.KeyboardLayoutChanged;
};

export const getIsOutputsChangedIpcEvent = (event: IpcEvent): event is IpcEventOutputsChanged => {
    return event.type === IpcEventType.OutputsChanged;
};

export const getIsWorkspacesChangedIpcEvent = (event: IpcEvent): event is IpcEventWorkspacesChanged => {
    return event.type === IpcEventType.WorkspacesChanged;
};

export const getIsWindowsChangedIpcEvent = (event: IpcEvent): event is IpcEventWindowsChanged => {
    return event.type === IpcEventType.WindowsChanged;
};
