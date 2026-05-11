import { KeyboardLayout } from './input';
import { OutputModeState as OutputModeStateType, OutputPowerMode } from './system';

export enum IpcEventType {
    KeyboardLayoutChanged = 'keyboard.layout.changed',
    OutputsChanged = 'outputs.changed',
    OutputCreated = 'output.created',
    OutputChanged = 'output.changed',
    OutputRemoved = 'output.removed',
    WorkspacesChanged = 'workspaces.changed',
    WorkspaceCreated = 'workspace.created',
    WorkspaceChanged = 'workspace.changed',
    WorkspaceRemoved = 'workspace.removed',
    WindowsChanged = 'windows.changed',
}

export type IpcEventKeyboardLayoutChanged = {
    type: IpcEventType.KeyboardLayoutChanged;
    payload: KeyboardState;
};

export type IpcEventOutputsChanged = {
    type: IpcEventType.OutputsChanged;
    payload: OutputInfoState[];
};

export type IpcEventOutputCreated = {
    type: IpcEventType.OutputCreated;
    payload: OutputInfoState;
};

export type IpcEventOutputChanged = {
    type: IpcEventType.OutputChanged;
    payload: OutputInfoState;
};

export type IpcEventOutputRemoved = {
    type: IpcEventType.OutputRemoved;
    payload: OutputInfoState;
};

export type IpcEventWorkspacesChanged = {
    type: IpcEventType.WorkspacesChanged;
    payload: WorkspaceInfoState[];
};

export type IpcEventWorkspaceCreated = {
    type: IpcEventType.WorkspaceCreated;
    payload: WorkspaceInfoState;
};

export type IpcEventWorkspaceChanged = {
    type: IpcEventType.WorkspaceChanged;
    payload: WorkspaceInfoState;
};

export type IpcEventWorkspaceRemoved = {
    type: IpcEventType.WorkspaceRemoved;
    payload: WorkspaceInfoState;
};

export type IpcEventWindowsChanged = {
    type: IpcEventType.WindowsChanged;
    payload: WindowInfoState[];
};

export type IpcEvent =
    | IpcEventKeyboardLayoutChanged
    | IpcEventOutputsChanged
    | IpcEventOutputCreated
    | IpcEventOutputChanged
    | IpcEventOutputRemoved
    | IpcEventWorkspacesChanged
    | IpcEventWorkspaceCreated
    | IpcEventWorkspaceChanged
    | IpcEventWorkspaceRemoved
    | IpcEventWindowsChanged;

export type State = {
    input: InputState;
    output: OutputState;
    workspaces: WorkspacesState;
    windows: WindowsState;
};

export type InputState = {
    keyboard: KeyboardState;
};

export type KeyboardState = {
    layout: string;
    layout_short: KeyboardLayout;
};

export type OutputState = {
    outputs: OutputInfoState[];
};

export type OutputInfoState = {
    name: string;
    model: string;
    description: string;
    mode: OutputModeState;
    scale: number;
    power?: OutputPowerState;
};

export type OutputModeState = {
    width: number;
    height: number;
    refresh: number;
    state: OutputModeStateType;
};

export type OutputPowerState = {
    mode: OutputPowerMode;
};

export type WorkspacesState = {
    workspaces: WorkspaceInfoState[];
};

export type WorkspaceInfoState = {
    id?: string;
    name: string;
    is_active: boolean;
    is_urgent: boolean;
    is_hidden: boolean;
    output: string;
};

export type WindowsState = WindowInfoState[];

export type WindowInfoState = {
    id: string;
    app_id: string;
    parent_id: string | null;
    title: string;
    is_activated: boolean;
    is_fullscreen: boolean;
    is_maximized: boolean;
    is_minimized: boolean;
    outputs: string[];
    workspaces: string[];
};
