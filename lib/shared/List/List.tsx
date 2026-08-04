import { Gtk } from 'ags/gtk4';
import { Item } from './types';
import cn from 'classnames';
import { For } from 'gnim';
import { MAX_SCROLLABLE_HEIGHT } from '../../constants/widget';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { Button } from '../buttons';
import Pango from 'gi://Pango?version=1.0';
import { DummyWrapper } from '../DummyWrapper';
import { Spacing } from '@/types/common';

export interface IList<P = object, V = string> {
    items: PropertyValue<Item<P, V>[]>;
    orientation?: Gtk.Orientation;
    css?: PropertyValue<string>;
    vexpand?: PropertyValue<boolean>;
    hexpand?: PropertyValue<boolean>;
    itemHalign?: PropertyValue<Gtk.Align>;
    ellipsize?: Pango.EllipsizeMode;
    maxWidthChar?: PropertyValue<number>;
    classes?: Classes<'root' | 'scrollContainer' | 'item'>;
    onSelect?: (item: Item<P, V>) => void;
}

export function List<P = object, V = string>(props: IList<P, V>) {
    const {
        items,
        orientation = Gtk.Orientation.VERTICAL,
        vexpand,
        hexpand,
        itemHalign = Gtk.Align.START,
        ellipsize = Pango.EllipsizeMode.MIDDLE,
        maxWidthChar = 15,
        css = '',
        classes,
        onSelect
    } = props;

    return (
        <box
            class={updateAccessor(classes?.root, root => cn('list', root))}
            vexpand={vexpand}
            hexpand={hexpand}
            css={css}
        >
            <Gtk.ScrolledWindow
                class={updateAccessor(classes?.scrollContainer, (scrollContainer, get) => cn(
                    scrollContainer,
                    'list-scroll-container',
                    get(items).length <= 1 && 'list-scroll-container_low-content'
                ))}
                maxContentHeight={MAX_SCROLLABLE_HEIGHT}
                hexpand
                vexpand
                propagate_natural_height
                propagate_natural_width
            >
                <box orientation={orientation}>
                    <For each={toAccessor(items)}>
                        {(item: Item<P, V>) => {
                            const Wrapper = item.wrapper || DummyWrapper;

                            return (
                                <Wrapper item={item}>
                                    <Button
                                        classes={{
                                            root: updateAccessor(classes?.item, item => cn(item, 'list__item', 'list-item'))
                                        }}
                                        onClick={() => onSelect?.(item)}
                                        hexpand
                                        spacing={Spacing.M}
                                    >
                                        {item.icon}

                                        {item.component || (
                                            <label
                                                label={item.name}
                                                ellipsize={ellipsize}
                                                maxWidthChars={maxWidthChar}
                                                halign={itemHalign}
                                                hexpand
                                            />
                                        )}

                                        {item.isActive && (
                                            <label label="" class="list-item__active-icon" halign={Gtk.Align.END} />
                                        )}
                                    </Button>
                                </Wrapper>
                            );
                        }}
                    </For>
                </box>
            </Gtk.ScrolledWindow>
        </box>
    );
}
