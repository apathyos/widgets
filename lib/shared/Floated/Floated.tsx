import Gtk from 'gi://Gtk';
import { createComputed, createState, With } from 'gnim';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { getWidgetAbsolutePosition, trackWidgetSurfaceMonitorAttachment } from '../../utils/widget';
import { timeout } from 'ags/time';
import { Window } from '../Window';
import { Astal } from 'ags/gtk4';
import { Align, Offset, Placement } from '../../types/common';
import cn from 'classnames';
import { TransitionOptions } from '../../types/widget';

export interface IFloated {
    children: (args: {
        toggleOpen: () => void;
    }) => JSX.Element;
    isRootMounted?: PropertyValue<boolean>;
    anchorRef: PropertyValue<Gtk.Widget | null> | undefined;
    anchorOffset?: PropertyValue<Offset>;
    align?: PropertyValue<Align>;
    placement?: PropertyValue<Placement>;
    floatContent: (args: {
        toggleOpen: () => void;
    }) => JSX.Element;
    transitionOptions?: PropertyValue<TransitionOptions>;
    withArrow?: PropertyValue<boolean>;
    classes?: Classes<'arrow'>;
    onOpen?: (args: {
        shouldOpen: boolean;
    }) => void;
}

export function Floated(props: IFloated) {
    const {
        isRootMounted,
        anchorRef,
        anchorOffset = Offset.S,
        floatContent,
        transitionOptions = {},
        withArrow = false,
        align = Align.CENTER,
        placement = Placement.TOP,
        classes,
        onOpen
    } = props;

    const [isOpened, setIsOpened] = createState(false);
    const [isRevealed, setIsRevealed] = createState(false);
    const [elementPosition, setElementPosition] = createState({ top: 0, left: 0, bottom: 0, right: 0 });
    const [contentWidth, setContentWidth] = createState(0);

    const anchor = createComputed<Astal.WindowAnchor>(get => {
        const popupPlacement = get(toAccessor(placement));

        if (popupPlacement === Placement.TOP) {
            return Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT;
        }

        return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT;
    });

    const contentContainerCss = createComputed(get => `min-width: ${get(contentWidth)}px;`);
    const contentOrientation = createComputed(get => {
        const popupPlacement = get(toAccessor(placement));

        if (popupPlacement === Placement.TOP || popupPlacement === Placement.BOTTOM) {
            return Gtk.Orientation.VERTICAL;
        }

        return Gtk.Orientation.HORIZONTAL;
    });

    let contentContainerRef: Gtk.Box | null = null;

    toAccessor(isRootMounted).subscribe(() => {
        if (unpackAccessor(isRootMounted) === false) {
            setIsRevealed(false);
            setIsOpened(false);
        }
    });

    const onWindowVisible = () => {
        const anchorElement = unpackAccessor(anchorRef);
        const elementAlign = unpackAccessor(align);

        if (!anchorElement || !contentContainerRef) {
            return;
        }

        trackWidgetSurfaceMonitorAttachment(anchorElement, () => {
            if (!anchorElement || !contentContainerRef) {
                return;
            }

            const offset = unpackAccessor(withArrow) ? Offset.XS : unpackAccessor(anchorOffset);

            const { top, left, bottom, right } = getWidgetAbsolutePosition(anchorElement);
            const anchorGeometry = anchorElement.get_allocation();
            const contentContainerGeometry = contentContainerRef.get_allocation();

            const elementTop = top + anchorGeometry.height + offset;
            let elementLeft = left;
            const elementBottom = bottom - anchorGeometry.height + offset;
            const elementRight = right - anchorGeometry.width;

            if (elementAlign === Align.START) {
                elementLeft -= 0;
            } else if (elementAlign === Align.END) {
                elementLeft -= anchorGeometry.width;
            } else {
                elementLeft -= Math.abs(contentContainerGeometry.width - anchorGeometry.width - 1) / 2;
            }

            setElementPosition({
                top: elementTop,
                left: elementLeft,
                bottom: elementBottom,
                right: elementRight
            });
            setContentWidth(Math.max(anchorGeometry.width + 1, contentContainerGeometry.width));
        });
    };

    const toggleOpen = (args?: { shouldOpen?: boolean }) => {
        const shouldOpen = args?.shouldOpen ?? !unpackAccessor(isOpened);

        if (!shouldOpen) {
            setIsRevealed(false);
            timeout(unpackAccessor(transitionOptions)?.duration ?? 0, () => setIsOpened(false));
            onOpen?.({ shouldOpen });
            return;
        }

        const anchorElement = unpackAccessor(anchorRef);

        if (anchorElement) {
            setIsOpened(true);
            setIsRevealed(true);

            onOpen?.({ shouldOpen });
        }
    };

    const FloatContent = (
        <Gtk.Box
            $={self => (contentContainerRef = self)}
            orientation={contentOrientation}
            hexpand
            css={contentContainerCss}
        >
            <With value={toAccessor(placement)}>
                {(placement) => placement === Placement.TOP || placement === Placement.LEFT ? floatContent({ toggleOpen }) : null}
            </With>

            <box homogeneous>
                <With value={toAccessor(withArrow)}>
                    {(withArrow: boolean) => withArrow ? (
                        <box
                            class={updateAccessor(
                                classes?.arrow,
                                (arrow, get) => cn(arrow, 'floated__arrow', `floated__arrow_placement-${get(placement)}`)
                            )}
                            halign={Gtk.Align.CENTER}
                            valign={Gtk.Align.CENTER}
                        >
                            <overlay>
                                <box class="floated__arrow_bottom" />
                                <box
                                    $type="overlay"
                                    class="floated__arrow_top"
                                    valign={Gtk.Align.CENTER}
                                    halign={Gtk.Align.CENTER}
                                />
                            </overlay>
                        </box>
                    ) : null}
                </With>
            </box>

            <With value={toAccessor(placement)}>
                {(placement) => placement === Placement.BOTTOM || placement === Placement.RIGHT
                    ? floatContent({ toggleOpen })
                    : null
                }
            </With>
        </Gtk.Box>
    );

    <Window
        isVisible={isOpened}
        anchor={anchor}
        canTarget
        margin={{
            top: elementPosition((v) => v.top),
            left: elementPosition((v) => v.left),
            bottom: elementPosition((v) => v.bottom),
            right: elementPosition((v) => v.right)
        }}
        layer={Astal.Layer.TOP}
        keymode={Astal.Keymode.ON_DEMAND}
        onActive={({ window }) => !window.isActive && toggleOpen({ shouldOpen: false })}
        onVisible={onWindowVisible}
        css={createComputed(get => `opacity: ${get(isOpened) ? '1' : '0.1'};`)}
    >
        <With value={toAccessor(transitionOptions)}>
            {(transitionOptions: TransitionOptions) => transitionOptions.enabled
                ? (
                    <revealer
                        revealChild={isRevealed}
                        transitionType={transitionOptions.type ?? Gtk.RevealerTransitionType.CROSSFADE}
                        transition_duration={transitionOptions.duration ?? 0}
                        hexpand
                    >
                        {FloatContent}
                    </revealer>
                ) : FloatContent
            }
        </With>
    </Window>;

    return props.children({ toggleOpen });
}
