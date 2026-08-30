import { IListItemBase, ListItemBase } from '../base/ListItemBase';
import { Item } from '../base/ListItemBase/types';
import { Spacing, Transition } from '@/types/common';
import { Classes, PropertyValue } from '@/types/utils';
import { toAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';
import { createComputed } from 'gnim';

export interface IRevealerListItem<P = object, I extends Item<P> = Item<P>> extends IListItemBase<P, I> {
    isRevealed: PropertyValue<boolean>;
    transitionType?: PropertyValue<Gtk.RevealerTransitionType>;
    transitionDuration?: PropertyValue<number>;
    spacing?: PropertyValue<Spacing>;
    classes?: IListItemBase<P>['classes'] & Classes<'root'>;
}

export function RevealerListItem<P = object, I extends Item<P> = Item<P>>(props: IRevealerListItem<P, I>) {
    const {
        isRevealed,
        transitionType,
        transitionDuration = Transition.FAST,
        spacing = 0,
        classes,
        ...restProps
    } = props;

    const paddingTop = createComputed(get => get(toAccessor(spacing)) / 2);
    const paddingBottom = createComputed(get => get(toAccessor(spacing)) / 2);

    return (
        <Gtk.Revealer
            class={classes?.root}
            revealChild={isRevealed}
            transitionType={transitionType}
            transitionDuration={transitionDuration}
        >
            <box
                css={createComputed(get => `
                    padding-top: ${get(paddingTop)}px;
                    padding-bottom: ${get(paddingBottom)}px;
                `)}
            >
                <ListItemBase {...restProps} />
            </box>
        </Gtk.Revealer>
    );
}
