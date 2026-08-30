import { Children, Classes, PropertyValue } from '@/types/utils';
import { toAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';
import { For } from 'gnim';

export interface IListBase {
    children?: Children;
    ref?: (self: Gtk.ScrolledWindow) => void;
    values: PropertyValue<string[]>;
    vexpand?: PropertyValue<boolean>;
    hexpand?: PropertyValue<boolean>;
    scroller?: {
        visible?: PropertyValue<boolean>;
        maxContentHeight?: PropertyValue<number>;
        vexpand?: PropertyValue<boolean>;
        hexpand?: PropertyValue<boolean>;
        vscrollbarPolicy?: PropertyValue<Gtk.PolicyType>;
    };
    orientation?: PropertyValue<Gtk.Orientation>;
    spacing?: PropertyValue<number>;
    classes?: Classes<'root' | 'scrollContainer'>;
    render: (value: string) => JSX.Element;
}

export function ListBase(props: IListBase) {
    const {
        ref,
        values,
        vexpand,
        hexpand,
        scroller,
        orientation = Gtk.Orientation.VERTICAL,
        spacing,
        classes,
        render
    } = props;

    return (
        <box
            class={classes?.root}
            vexpand={vexpand}
            hexpand={hexpand}
        >
            <Gtk.ScrolledWindow
                $={ref}
                class={classes?.scrollContainer}
                {...scroller}
                maxContentHeight={scroller?.maxContentHeight ?? 250}
                hexpand={scroller?.hexpand ?? true}
                vexpand={scroller?.vexpand ?? true}
                propagateNaturalHeight
                propagateNaturalWidth
            >
                <Gtk.Viewport
                    vscrollPolicy={Gtk.ScrollablePolicy.NATURAL}
                    scrollToFocus={false}
                >
                    <box
                        orientation={orientation}
                        spacing={spacing}
                        vexpand
                    >
                        {props.children ?? (
                            <For each={toAccessor(values)}>
                                {(value: string) => render(value)}
                            </For>
                        )}
                    </box>
                </Gtk.Viewport>
            </Gtk.ScrolledWindow>
        </box>
    );
}
