import app from 'ags/gtk4/app';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { PropertyValue } from '../../types/utils';
import { Margin } from '../../types/common';
import { toAccessor, unpackAccessor } from '../../utils/misc';
import { createComputed } from 'gnim';
import { trackWidgetSurfaceMonitorAttachment } from '../../utils/widget';

export interface IPopover {
    children?: JSX.Element;
    ref?: (self: Astal.Window) => void;
    destroyWithParent?: PropertyValue<boolean>;
    isMounted?: PropertyValue<boolean>;
    isVisible?: PropertyValue<boolean>;
    monitor?: PropertyValue<Gdk.Monitor>;
    margin?: Margin;
    anchor?: PropertyValue<Astal.WindowAnchor>;
    layer?: PropertyValue<Astal.Layer>;
    exclusivity?: PropertyValue<Astal.Exclusivity>;
    resizable?: PropertyValue<boolean>;
    heightRequest?: PropertyValue<number>;
    widthRequest?: PropertyValue<number>;
    hexpand?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    canTarget?: PropertyValue<boolean>;
    keymode?: PropertyValue<Astal.Keymode>;
    css?: PropertyValue<string>;
    onMount?: (args: { ref: Astal.Window; monitor: Gdk.Monitor; }) => void;
    onClick?: (args: { event: Gtk.GestureClick }) => void;
    onMouseMove?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseEnter?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseLeave?: (args: { event: Gtk.EventControllerMotion }) => void;
    onKeyDown?: (args: { event: Gtk.EventControllerKey }) => void;
    onActive?: (args: { window: Astal.Window }) => void;
}

export function Popover(props: IPopover) {
    const {
        ref,
        destroyWithParent = true,
        isMounted = true,
        isVisible = true,
        monitor,
        margin,
        anchor,
        layer,
        exclusivity,
        resizable = false,
        heightRequest,
        widthRequest,
        hexpand,
        vexpand,
        canTarget,
        keymode = Astal.Keymode.NONE,
        css,
        onMount,
        onClick,
        onMouseMove,
        onMouseEnter,
        onMouseLeave,
        onKeyDown,
        onActive
    } = props;

    let windowRef: Astal.Window | null = null;
    const shouldDisplay = createComputed(get => get(toAccessor(isMounted)) && get(toAccessor(isVisible)));

    const clickController = new Gtk.GestureClick();
    clickController.connect('pressed', (event) => onClick?.({ event }));

    const moveController = new Gtk.EventControllerMotion();
    moveController.connect('motion', (event) => onMouseMove?.({ event }));

    const mouseEnterController = new Gtk.EventControllerMotion();
    mouseEnterController.connect('enter', (event) => onMouseEnter?.({ event }));

    const mouseLeaveController = new Gtk.EventControllerMotion();
    mouseLeaveController.connect('leave', (event) => onMouseLeave?.({ event }));

    const keyController = new Gtk.EventControllerKey();
    keyController.connect('key-pressed', (event) => onKeyDown?.({ event }));

    toAccessor(isMounted).subscribe(() => {
        if (!unpackAccessor(isMounted)) {
            windowRef && windowRef.destroy();
        }
    });

    return (
        <window
            $={(self) => {
                windowRef = self;
                self.add_controller(clickController);
                self.add_controller(moveController);
                self.add_controller(mouseEnterController);
                self.add_controller(mouseLeaveController);
                self.add_controller(keyController);

                ref?.(self);

                trackWidgetSurfaceMonitorAttachment(self, monitor => onMount?.({ ref: self, monitor }));
            }}
            class="popover"
            canTarget={canTarget}
            keymode={keymode}
            resizable={resizable}
            application={app}
            gdkmonitor={monitor}
            visible={shouldDisplay}
            margin_top={margin?.top}
            margin_left={margin?.left}
            margin_right={margin?.right}
            margin_bottom={margin?.bottom}
            anchor={anchor}
            layer={layer}
            exclusivity={exclusivity}
            vexpand={vexpand}
            hexpand={hexpand}
            css={css}
            destroyWithParent={destroyWithParent}
            heightRequest={heightRequest}
            widthRequest={widthRequest}
            onNotifyIsActive={window => onActive?.({ window })}
        >
            {props.children}
        </window>
    );
}
