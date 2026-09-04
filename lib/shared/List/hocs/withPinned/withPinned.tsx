import { Revealer } from '@/shared/Revealer';
import { Transition } from '@/types/common';
import { Children, PropertyValue } from '@/types/utils';
import { toAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';
import { createComputed, FCProps, For } from 'gnim';
import { IList } from '../../List';
import { ListItemBase } from '@/shared/base/ListItemBase';

export interface IwithPinned {
    pinned: PropertyValue<string[]>;
    isRevealed?: PropertyValue<boolean>;
    transitionType?: PropertyValue<Gtk.RevealerTransitionType>;
    transitionDuration?: PropertyValue<number>;
}

export function withPinned<P, T extends IList<P>>(Component: (props: FCProps<Gtk.ScrolledWindow, T>) => Children) {
    return (props: IwithPinned & FCProps<Gtk.ScrolledWindow, T>) => {
        const {
            values,
            pinned,
            orientation = Gtk.Orientation.VERTICAL,
            spacing,
            isRevealed,
            transitionType,
            transitionDuration = Transition.FASTER,
            getItem,
        } = props;

        const restItemsValues = createComputed(get => {
            const unpackedValues = get(toAccessor(values));
            const pinnedItems = new Set(get(toAccessor(pinned)));

            return !pinnedItems.size ? unpackedValues : unpackedValues.filter(value => !pinnedItems.has(value));
        });

        const contentContainerCss = createComputed(get => `margin-top: ${get(toAccessor(spacing))}px;`);

        return (
            <Component
                {...props}
                spacing={0}
            >
                <box
                    visible={toAccessor(pinned)(v => !!v.length)}
                    orientation={orientation}
                    spacing={spacing}
                >
                    <For each={toAccessor(pinned)}>
                        {(value: string) => <ListItemBase item={getItem(value)} />}
                    </For>
                </box>

                <Revealer
                    lazy
                    visible={toAccessor(restItemsValues)(v => !!v.length)}
                    isRevealed={isRevealed}
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                    vexpand={false}
                >
                    {() => (
                        <box
                            css={contentContainerCss}
                            orientation={orientation}
                            spacing={spacing}
                        >
                            <For each={restItemsValues}>
                                {(value: string) => <ListItemBase item={getItem(value)} />}
                            </For>
                        </box>
                    )}
                </Revealer>
            </Component>
        );
    };
}
