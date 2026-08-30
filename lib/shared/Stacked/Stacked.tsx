import { Transition } from '@/types/common';
import { Children, PropertyValue } from '@/types/utils';
import { updateAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';

export interface IStacked {
    children: Children;
    stackChildren: Children;
    visiblePage: PropertyValue<string>;
    isStackVisible?: PropertyValue<boolean>;
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
}

export function Stacked(props: IStacked) {
    const {
        visiblePage,
        isStackVisible = true,
        interpolateSize = true,
        hhomogeneous = false,
        vhomogeneous = false,
        hexpand,
        vexpand = false,
        halign,
        valign = Gtk.Align.START,
        canTarget = false,
        transitionType = Gtk.StackTransitionType.CROSSFADE,
        transitionDuration = Transition.FASTER,
        onNotifyTransitionRunning
    } = props;

    return (
        <Gtk.Overlay
            overflow={Gtk.Overflow.HIDDEN}
        >
            <Gtk.Stack
                visibleChildName={visiblePage}
                interpolateSize={interpolateSize}
                hhomogeneous={hhomogeneous}
                vhomogeneous={vhomogeneous}
                transitionType={transitionType}
                transitionDuration={transitionDuration}
                hexpand={hexpand}
                vexpand={vexpand}
                halign={halign}
                valign={valign}
                canTarget={canTarget}
                onNotifyTransitionRunning={onNotifyTransitionRunning}
                css={updateAccessor(isStackVisible, isVisible => `opacity: ${isVisible ? '1' : '0'};`)}
            >
                {props.stackChildren}
            </Gtk.Stack>

            <box
                $type="overlay"
            >
                {props.children}
            </box>
        </Gtk.Overlay>
    );
}
