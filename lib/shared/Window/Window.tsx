import app from 'ags/gtk4/app';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue, Reactive } from '../../types/utils';
import { Margin } from '../../types/common';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { createComputed, createState, onCleanup } from 'gnim';
import { useSetupControllers } from '../../hooks/use-setup-controllers';
import { useVisibilityHandler } from '../../hooks/use-visibility-handler';
import cn from 'classnames';

export interface IWindow {
    children?: Children;
    ref?: (self: Astal.Window) => void;
    destroyWithParent?: PropertyValue<boolean>;
    isMounted?: PropertyValue<boolean>;
    isVisible?: PropertyValue<boolean>;
    monitor?: PropertyValue<Gdk.Monitor>;
    margin?: Reactive<Margin>;
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
    classes?: Classes<'root'>;
    onVisible?: (args: { ref: Astal.Window; monitor: Gdk.Monitor; }) => void;
    onClick?: (args: { event: Gtk.GestureClick }) => void;
    onMouseMove?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseEnter?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseLeave?: (args: { event: Gtk.EventControllerMotion }) => void;
    onKeyDown?: (args: { event: Gtk.EventControllerKey }) => void;
    onActive?: (args: { window: Astal.Window }) => void;
}

export function Window(props: IWindow) {
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
        classes,
        onVisible,
        onClick,
        onMouseMove,
        onMouseEnter,
        onMouseLeave,
        onKeyDown,
        onActive
    } = props;

    const [hasShown, setHasShown] = createState(false);

    let windowRef: Astal.Window | null = null;
    const shouldDisplay = createComputed(get => get(toAccessor(isMounted)) && get(toAccessor(isVisible)));

    const { onSetup } = useSetupControllers({ onClick, onMouseMove, onMouseEnter, onMouseLeave, onKeyDown });
    const handleVisibilityChange = useVisibilityHandler<Astal.Window>({
        onVisible: ({ ref, monitor }) => {
            setHasShown(true);
            onVisible?.({ ref, monitor });
        }
    });

    const mountedSub = toAccessor(isMounted).subscribe(() => {
        if (!unpackAccessor(isMounted)) {
            windowRef && windowRef.destroy();
        }
    });

    onCleanup(() => mountedSub());

    return (
        <Astal.Window
            $={(self) => {
                windowRef = self;
                onSetup(self);
                ref?.(self);
                handleVisibilityChange(self);
            }}
            class={updateAccessor(
                classes?.root,
                (root, get) => cn(root, 'window', !get(hasShown) && 'window_hidden')
            )}
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
            onNotifyVisible={handleVisibilityChange}
        >
            {props.children}
        </Astal.Window>
    );
}
