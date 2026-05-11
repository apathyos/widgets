import { Astal, Gtk } from 'ags/gtk4';
import { ModalBase } from '../base/ModalBase';
import { NotificationToastVariant } from './types';
import { INotificationAppToast, NotificationAppToast } from './NotificationAppToast';
import { INotificationMultimediaToast, NotificationMulimediaToast } from './NotificationMultimediaToast';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { INotificationOsdToast, NotificationOsdToast } from './NotificationOsdToast/NotificationOsdToast';
import { Accessor, createComputed, With } from 'gnim';
import GObject from 'gnim/gobject';

export type INotificationToast =
    | INotificationAppToast
    | INotificationMultimediaToast
    | INotificationOsdToast;

type NotificationToastComponentConstructor = (props: INotificationToast) => GObject.Object;

export function NotificationToast(props: INotificationToast) {
    const {
        ref,
        variant,
        classes,
        onClick,
        onMouseEnter,
        onMouseLeave,
        onMouseMove,
        onKeyDown
    } = props;

    let windowRef: Astal.Window | null = null;

    const onClose = () => {
        windowRef?.destroy();
        props.onClose?.();
    };

    const Component = createComputed(() => {
        switch (variant) {
            case NotificationToastVariant.OSD:
                return NotificationOsdToast;
            case NotificationToastVariant.MULTIMEDIA:
                return NotificationMulimediaToast;
            default:
                return NotificationAppToast;
        }
    });

    return (
        <ModalBase
            ref={self => {
                windowRef = self;
                ref?.(self);
            }}
            orientation={Gtk.Orientation.VERTICAL}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            margin={{
                top: 40,
                right: 50
            }}
            classes={{
                root: updateAccessor(classes?.root, root => cn(root, 'notification-toast'))
            }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
        >
            <With value={Component as unknown as Accessor<NotificationToastComponentConstructor>}>
                {(Component: NotificationToastComponentConstructor) => (
                    <Component
                        {...props}
                        onClose={onClose}
                    />
                )}
            </With>
        </ModalBase>
    );
}
