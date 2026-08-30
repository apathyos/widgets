import { Classes } from '@/types/utils';
import { Item } from './types';
import Pango from 'gi://Pango?version=1.0';
import { Gtk } from 'ags/gtk4';

export interface IListItemBaseContent<P> {
    item: Item<P>;
    classes?: Classes<'label'>;
}

export function ListItemBaseContent<P = object>(props: IListItemBaseContent<P>) {
    const {
        item: {
            name,
            ellipsize = Pango.EllipsizeMode.MIDDLE,
            maxWidthChar = 25,
            halign = Gtk.Align.START
        },
        classes
    } = props;

    return (
        <label
            class={classes?.label}
            label={name}
            ellipsize={ellipsize}
            maxWidthChars={maxWidthChar}
            halign={halign}
            hexpand
        />
    );
}
