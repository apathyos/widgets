import { Transition } from '@/types/common';
import { Children, PropertyValue } from '@/types/utils';
import { updateAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';

export interface IStacked {
    children: Children;
    stackChildren: Children;
    visiblePage: PropertyValue<string>;
    overlay?: {
        ref?: (self: Gtk.Overlay) => void;
        hexpand?: PropertyValue<boolean>;
        vexpand?: PropertyValue<boolean>;
        halign?: PropertyValue<Gtk.Align>;
        valign?: PropertyValue<Gtk.Align>;
        overflow?: PropertyValue<Gtk.Overflow>;
    };
    stack?: {
        ref?: (self: Gtk.Stack) => void;
        isHidden?: PropertyValue<boolean>;
        interpolateSize?: PropertyValue<boolean>;
        hhomogeneous?: PropertyValue<boolean>;
        vhomogeneous?: PropertyValue<boolean>;
        vexpand?: PropertyValue<boolean>;
        hexpand?: PropertyValue<boolean>;
        valign?: PropertyValue<Gtk.Align>;
        halign?: PropertyValue<Gtk.Align>;
        canTarget?: PropertyValue<boolean>;
        transitionType?: PropertyValue<Gtk.StackTransitionType>;
        transitionDuration?: PropertyValue<number>;
        onNotifyTransitionRunning?: (self: Gtk.Stack) => void;
    };
}

export function Stacked(props: IStacked) {
    const {
        visiblePage,
        overlay,
        stack,
    } = props;

    let overlayRef: Gtk.Overlay | null = null;

    return (
        <Gtk.Overlay
            $={self => {
                overlay?.ref?.(self);
                overlayRef = self;
            }}
            hexpand={overlay?.hexpand}
            vexpand={overlay?.vexpand}
            halign={overlay?.halign}
            valign={overlay?.valign}
            overflow={overlay?.overflow ?? Gtk.Overflow.HIDDEN}
        >
            <Gtk.Stack
                $={stack?.ref}
                visibleChildName={visiblePage}
                interpolateSize={stack?.interpolateSize ?? true}
                hhomogeneous={stack?.hhomogeneous ?? false}
                vhomogeneous={stack?.vhomogeneous ?? false}
                transitionType={stack?.transitionType ?? Gtk.StackTransitionType.CROSSFADE}
                transitionDuration={stack?.transitionDuration ?? Transition.FASTER}
                hexpand={stack?.hexpand}
                vexpand={stack?.vexpand ?? false}
                halign={stack?.halign}
                valign={stack?.valign ?? Gtk.Align.START}
                canTarget={stack?.canTarget ?? false}
                onNotifyTransitionRunning={stack?.onNotifyTransitionRunning}
                opacity={updateAccessor(stack?.isHidden, isHidden => isHidden ? 0 : 1)}
            >
                {props.stackChildren}
            </Gtk.Stack>

            <box
                $type="overlay"
                $={self => {
                    if (overlayRef) {
                        overlayRef.set_measure_overlay(self, false);
                        overlayRef.set_clip_overlay(self, true);
                    }
                }}
                hexpand
                vexpand={false}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.START}
            >
                {props.children}
            </box>
        </Gtk.Overlay>
    );
}
