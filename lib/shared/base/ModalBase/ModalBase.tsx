import { Children, Classes, PropertyValue } from '../../../types/utils';
import { IPopover, Popover } from '../../Popover';
import { Astal, Gtk } from 'ags/gtk4';
import { getWidgetMonitor } from '../../../utils/display';
import { createComputed, createState } from 'gnim';
import { Margin } from '../../../types/common';
import { unpackAccessor } from '../../../utils/misc';

export interface IModalBase extends Pick<
    IPopover,
    | 'onMouseEnter'
    | 'onMouseLeave'
    | 'onMouseMove'
    | 'onClick'
    | 'onKeyDown'
> {
    children: Children;
    ref?: (self: Astal.Window) => void;
    orientation?: PropertyValue<Gtk.Orientation>;
    margin?: PropertyValue<Margin>;
    anchor?: Astal.WindowAnchor;
    spacing?: PropertyValue<number>;
    classes?: Classes<'root'>;
}

export function ModalBase(props: IModalBase) {
    const {
        ref,
        orientation,
        margin,
        anchor = Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT,
        spacing,
        classes,
        onClick,
        onMouseEnter,
        onMouseLeave,
        onMouseMove,
        onKeyDown
    } = props;

    let ticks = 0;
    let windowRef: Astal.Window | null = null;

    const [isVisible, setIsVisible] = createState(false);

    const windowCss = createComputed(get => (
        `
            opacity: ${get(isVisible) ? 1 : 0};
        `
    ));

    return (
        <Popover
            ref={self => {
                windowRef = self;
                ref?.(self);
            }}
            isMounted
            anchor={anchor}
            layer={Astal.Layer.OVERLAY}
            css={windowCss}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
        >
            <box
                hexpand={false}
                $={self => {
                    self?.add_tick_callback(() => {
                        const monitor = getWidgetMonitor(self);

                        if (!windowRef || !monitor || ticks++ < 1) {
                            return true;
                        }

                        const alloc = self.get_allocation();
                        const mgeo = monitor.get_geometry();

                        const marginTop = unpackAccessor(unpackAccessor(margin)?.top);
                        const marginLeft = unpackAccessor(unpackAccessor(margin)?.left);
                        const marginRight = unpackAccessor(unpackAccessor(margin)?.right);
                        const marginBottom = unpackAccessor(unpackAccessor(margin)?.bottom);

                        windowRef.marginTop = marginTop ?? mgeo.height / 2 - alloc.height / 2 - mgeo.height * 0.05;
                        windowRef.marginLeft = marginLeft ?? mgeo.width / 2 - alloc.width / 2;
                        marginRight !== undefined && (windowRef.marginRight = marginRight);
                        marginBottom !== undefined && (windowRef.marginBottom = marginBottom);

                        setIsVisible(true);

                        return false;
                    });
                }}
                orientation={orientation}
                spacing={spacing}
                class={classes?.root}
            >
                {props.children}
            </box>
        </Popover>
    );
}
