import { IList, List } from '../List';
import { ISelectListItem, SelectListItem } from '../SelectListItem';
import { SelectListItem as SelectListItemType } from '../SelectListItem/types';

export interface ISelectList<P = object, I extends SelectListItemType<P> = SelectListItemType<P>> extends IList<P, I> {
    onSelect?: ISelectListItem<P>['onSelect'];
}

export function SelectList<P = object, I extends SelectListItemType<P> = SelectListItemType<P>>(props: ISelectList<P, I>) {
    const { getItem, onSelect } = props;

    return (
        <List
            {...props}
            getItem={value => <SelectListItem item={getItem(value)} onSelect={onSelect} />}
        />
    );
}
