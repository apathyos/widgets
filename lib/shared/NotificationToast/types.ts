import { Gtk } from 'ags/gtk4';
import { Classes, PropertyValue } from '../../types/utils';
import { IModalBase } from '../base/ModalBase';

export enum NotificationToastVariant {
    APP,
    MULTIMEDIA,
    OSD
}

export interface INotificationToastBase extends Pick<
    IModalBase,
    | 'onMouseEnter'
    | 'onMouseLeave'
    | 'onMouseMove'
    | 'onClick'
    | 'onKeyDown'
> {
    ref?: (self: Gtk.Box) => void;
    title?: PropertyValue<string | undefined> | JSX.Element;
    summary?: PropertyValue<string | undefined> | JSX.Element;
    body: PropertyValue<string> | JSX.Element;
    classes?: Classes<'root'>;
    onClose?: () => void;
}
