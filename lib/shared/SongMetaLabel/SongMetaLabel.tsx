import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import Pango from 'gi://Pango?version=1.0';
import { Gtk } from 'ags/gtk4';

export interface ISongMetaLabel {
    label: PropertyValue<string>;
    classes?: Classes<'root'>;
}

export function SongMetaLabel(props: ISongMetaLabel) {
    const { label, classes } = props;

    return (
        <label
            class={updateAccessor(classes?.root, (root) => cn(root, 'song-meta-label'))}
            label={label}
            maxWidthChars={25}
            ellipsize={Pango.EllipsizeMode.END}
            halign={Gtk.Align.START}
        />
    );
}
