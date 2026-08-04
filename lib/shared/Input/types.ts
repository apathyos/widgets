import { ElementInfoText } from '@/types/widget';
import { Gtk } from 'ags/gtk4';

export enum InputInfoType {
    INFO,
    ERROR
}

type InputInfoTextBase = ElementInfoText & {
    halign?: Gtk.Align;
};

export type InputInfoText = InputInfoTextBase & {
    type: InputInfoType.INFO;
};

export type InputErrorText = InputInfoTextBase & {
    type: InputInfoType.ERROR;
};

export type InputInfo = InputInfoText | InputErrorText;
