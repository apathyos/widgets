import { toAccessor, updateAccessor } from '@/utils/misc';
import { ListItemBaseContent } from '../base/ListItemBase';
import { Button } from '../buttons';
import { With } from 'gnim';
import { Gtk } from 'ags/gtk4';
import { Item } from '../base/ListItemBase/types';
import { Spacing } from '@/types/common';
import cn from 'classnames';
import { Classes, PropertyValue } from '@/types/utils';
import { SelectListItem as SelectListItemType } from './types';
import { IListItem, ListItem } from '../ListItem';
import Pango from 'gi://Pango?version=1.0';

export interface ISelectListItem<
    P = object,
    I extends SelectListItemType<P> = SelectListItemType<P>
> extends IListItem<P, I> {
    maxWidthChar?: PropertyValue<number>;
    ellipsize?: PropertyValue<Pango.EllipsizeMode>;
    halign?: PropertyValue<Gtk.Align>;
    classes?: IListItem<P>['classes'] & Classes<'button'>;
    onSelect?: (item: Item<P>) => void;
}

export function SelectListItem<
    P = object,
    I extends SelectListItemType<P> = SelectListItemType<P>
>(props: ISelectListItem<P, I>) {
    const {
        maxWidthChar,
        ellipsize,
        halign,
        classes,
        onSelect
    } = props;

    return (
        <ListItem
            {...props}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, root => cn(root, 'select-list-item'))
            }}
        >
            {({ item }) => (
                <Button
                    classes={{
                        root: updateAccessor(classes?.button, button => cn(button, 'select-list-item__button'))
                    }}
                    onClick={() => onSelect?.(item)}
                    hexpand
                    spacing={Spacing.M}
                    isLoading={item.isLoading}
                    isDisabled={item.isDisabled}
                    isInactive={item.isInactive}
                    isVisible={item.isVisible}
                >
                    {item.icon}

                    <ListItemBaseContent
                        item={{
                            ...item,
                            ellipsize: item.ellipsize ?? ellipsize,
                            halign: item.halign ?? halign,
                            maxWidthChar: item.maxWidthChar ?? maxWidthChar
                        }}
                        classes={classes}
                    />

                    <With value={toAccessor(item.isActive)}>
                        {(isActive: boolean | undefined) => typeof isActive === 'boolean' ? (
                            <label label={isActive ? '' : ''} class="select-list-item__active-icon" halign={Gtk.Align.END} />
                        ) : null}
                    </With>
                </Button>
            )}
        </ListItem>
    );
}
