import { ListItem } from '../../types/common';
import { Children } from '../../types/utils';

export type Item<P = object, V = string> = ListItem<P, V> & {
    isActive?: boolean;
    icon?: JSX.Element | string;
    component?: JSX.Element;
    wrapper?: (props: {
        children: Children;
        item: Item<P, V>;
    }) => JSX.Element;
};
