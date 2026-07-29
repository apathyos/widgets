import { SymbolButton, Window as WindowComponent } from '../../shared';
import { WindowPosition } from '../../types/windowing';
import { WindowFactory } from '../../features';
import { Astal, Gtk } from 'ags/gtk4';
import { Spacing } from '../../types/common';
import { With } from 'gnim';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { isJSXElement } from '../../utils/typeguards';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { useWindowSystem } from '../../contexts/windowing';
import { getCenterPositionForWidget, getElementDragDelta, setElementMarginPositionForAnchor } from '../../utils/widget';
import { AnyWindow } from '../../models/types/windowing';

export interface IFloatingWindow {
    window: AnyWindow;
    classes?: Classes<'title' | 'close'>;
}

export function FloatingWindow(props: IFloatingWindow) {
    const { window, classes } = props;

    const { service } = useWindowSystem();

    let windowRef: Astal.Window | null = null;
    const options = window.descriptor.options;
    const title = window.title;
    const closable = options?.closable ?? true;
    const keymode = options?.keymode ?? Astal.Keymode.ON_DEMAND;

    const layer = options?.layer ?? Astal.Layer.TOP;
    const anchor = options?.anchor ?? Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT;
    let dragStart: WindowPosition = { x: 0, y: 0 };

    return (
        <WindowComponent
            ref={self => (windowRef = self)}
            layer={layer}
            anchor={anchor}
            keymode={keymode}
            onVisible={({ ref, monitor }) => {
                const initPosition = window.descriptor.options?.position;

                let x = initPosition?.x;
                let y = initPosition?.y;

                if (typeof y !== 'number' || typeof x !== 'number') {
                    const pos = getCenterPositionForWidget({ ref, monitor, anchor });

                    x = pos.left;
                    y = pos.top;
                }

                setElementMarginPositionForAnchor({ element: ref, anchor, position: { x, y } });
                window.setPosition({ x, y });
            }}
            classes={{ root: cn('floating-window', options?.noFrame && 'floating-window_no-frame') }}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={Spacing.XL}
                class="floating-window-content-container"
                hexpand
                vexpand
            >
                {!options?.noFrame && (closable || title) ? (
                    <box class="floating-window-title-container" hexpand>
                        <Gtk.GestureDrag
                            onDragBegin={() => (dragStart = unpackAccessor(window.position))}
                            onDragUpdate={(_, deltaX, deltaY) => {
                                if (!windowRef) {
                                    return;
                                }

                                const delta = getElementDragDelta({ anchor, delta: { x: deltaX, y: deltaY } });

                                setElementMarginPositionForAnchor({
                                    element: windowRef,
                                    anchor,
                                    position: { x: Math.round(dragStart.x + delta.x), y: Math.round(dragStart.y + delta.y) }
                                });
                            }}
                            onDragEnd={(_, deltaX, deltaY) => {
                                const delta = getElementDragDelta({ anchor, delta: { x: deltaX, y: deltaY } });
                                window.setPosition({ x: dragStart.x + delta.x, y: dragStart.y + delta.y });
                            }}
                        />
                        {title && (isJSXElement(title)
                            ? title
                            : (
                                    <label
                                        class={updateAccessor(classes?.title, title => cn(title, 'floating-window__title'))}
                                        label={title}
                                    />
                            )
                        )}

                        <With value={toAccessor(closable)}>
                            {(closable: boolean) => closable && (
                                <SymbolButton
                                    onClick={() => service.close(window.id)}
                                    hexpand
                                    halign={Gtk.Align.END}
                                    classes={{
                                        root: updateAccessor(
                                            classes?.close,
                                            (close) => cn(close, 'floating-window__close')
                                        )
                                    }}
                                >
                                    <label label="" />
                                </SymbolButton>
                            )}
                        </With>
                    </box>
                ) : null}

                <WindowFactory window={window} />

            </box>
        </WindowComponent>
    );
}
