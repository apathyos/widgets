import { IList } from '@/shared';
import { IListBase } from '@/shared/base/ListBase';
import { ListItemBase } from '@/shared/base/ListItemBase';
import { Any, Children } from '@/types/utils';
import { Gtk } from 'ags/gtk4';
import { FCProps } from 'gnim';

export function BaseListAdapter<T extends IListBase>(Component: (props: FCProps<Gtk.ScrolledWindow, T>) => Children) {
    return (props: FCProps<Gtk.ScrolledWindow, Omit<T, 'render'>> & { getItem: IList['getItem'] }) => (
        <Component {...props as Any} render={value => <ListItemBase item={props.getItem(value)} />} />
    );
}
