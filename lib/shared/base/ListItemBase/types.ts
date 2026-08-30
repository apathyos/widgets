import { ListItem } from '@/types/common';
import { Children, PropertyValue, ReactiveExcept } from '@/types/utils';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';

export type Item<P = object> = ReactiveExcept<ListItem<P, string>, 'value'> & {
    wrapper?: (props: {
        children: Children;
        item: Item<P>;
    }) => JSX.Element;
    halign?: PropertyValue<Gtk.Align>;
    ellipsize?: PropertyValue<Pango.EllipsizeMode>;
    maxWidthChar?: PropertyValue<number>;
};

export type ListItemData<P = object, I extends Item<P> = Item<P>> = I | null | undefined | JSX.Element;
export type GetListItemData<P = object, I extends Item<P> = Item<P>> = (value: string) => ListItemData<P, I>;
