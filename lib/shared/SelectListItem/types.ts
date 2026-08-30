import { Item } from '@/shared/base/ListItemBase/types';
import { PropertyValue } from '@/types/utils';
import { IButton } from '../buttons';

export type SelectListItem<P> = Item<P> & Pick<
    IButton,
    | 'isLoading'
    | 'isDisabled'
    | 'isInactive'
    | 'isVisible'
> & {
    isActive?: PropertyValue<boolean>;
    icon?: JSX.Element | PropertyValue<string>;
};
