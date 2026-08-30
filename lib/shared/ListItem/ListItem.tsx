import { IListItemBase, ListItemBase } from '../base/ListItemBase';
import { Classes } from '@/types/utils';
import { Item } from '../base/ListItemBase/types';

export interface IListItem<P = object, I extends Item<P> = Item<P>> extends IListItemBase<P, I> {
    classes?: IListItemBase<P>['classes'] & Classes<'root'>;
}

export function ListItem<P = object, I extends Item<P> = Item<P>>(props: IListItem<P, I>) {
    const { classes } = props;

    return (
        <box class={classes?.root} hexpand>
            <ListItemBase
                {...props}
                classes={{
                    label: classes?.label
                }}
            />
        </box>
    );
}
