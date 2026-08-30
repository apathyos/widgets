import { DummyWrapper } from '@/shared/DummyWrapper';
import { Item, ListItemData } from './types';
import { Children } from '@/types/utils';
import { IListItemBaseContent, ListItemBaseContent } from './ListItemBaseContent';
import { isJSXElement } from '@/utils/typeguards';

export interface IListItemBase<P = object, I extends Item<P> = Item<P>> {
    children?: (args: {
        item: I;
    }) => Children;
    item: ListItemData<P, I>;
    classes?: IListItemBaseContent<P>['classes'];
}

export function ListItemBase<P = object, I extends Item<P> = Item<P>>(props: IListItemBase<P, I>) {
    const { item, classes } = props;

    if (!item) {
        return <box />;
    }

    if (isJSXElement(item)) {
        return item;
    }

    const Wrapper = item.wrapper || DummyWrapper;

    return (
        <Wrapper item={item}>
            {props.children?.({ item }) ?? <ListItemBaseContent item={item} classes={classes} />}
        </Wrapper>
    );
}
