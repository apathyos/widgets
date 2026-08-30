import { PropertyValue } from '@/types/utils';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';

export interface INotificationBody {
    ref?: (self: Gtk.Label) => void;
    name?: PropertyValue<string>;
    label: PropertyValue<string>;
    tooltipText?: PropertyValue<string>;
    maxWidthChars?: PropertyValue<number>;
    lines?: PropertyValue<number>;
}

export function NotificationBody(props: INotificationBody) {
    const { ref, name, label, tooltipText, maxWidthChars, lines } = props;

    return (
        <label
            $={ref}
            $type="named"
            name={name}
            class="notification__body-label"
            label={label}
            tooltipText={tooltipText}
            wrap
            wrapMode={Pango.WrapMode.WORD_CHAR}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.START}
            xalign={0}
            useMarkup
            hexpand
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={maxWidthChars}
            lines={lines}
        />
    );
}
