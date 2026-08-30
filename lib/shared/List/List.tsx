import { updateAccessor } from '@/utils/misc';
import { IListBase, ListBase } from '../base/ListBase';
import { GetListItemData, Item } from '../base/ListItemBase/types';
import { ListItem } from '../ListItem';
import cn from 'classnames';
import { PropertyValue } from '@/types/utils';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';
import { Spacing } from '@/types/common';

export interface IList<P = object, I extends Item<P> = Item<P>> extends Omit<IListBase, 'render'> {
    itemHalign?: PropertyValue<Gtk.Align>;
    ellipsize?: Pango.EllipsizeMode;
    maxWidthChar?: PropertyValue<number>;
    getItem: GetListItemData<P, I>;
}

export function List<P = object, I extends Item<P> = Item<P>>(props: IList<P, I>) {
    const {
        values,
        spacing = Spacing.M,
        classes,
        getItem,
    } = props;

    return (
        <ListBase
            {...props}
            spacing={spacing}
            render={value => <ListItem item={getItem(value)} />}
            classes={{
                root: updateAccessor(classes?.root, root => cn(root, 'list')),
                scrollContainer: updateAccessor(classes?.scrollContainer, (scrollContainer, get) => cn(
                    scrollContainer,
                    'list-scroll-container',
                    get(values).length <= 1 && 'list-scroll-container_low-content'
                ))
            }}
        />
    );
}
