import Gtk from 'gi://Gtk';
import { createComputed, createState, With } from 'gnim';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { getWidgetAnchoredPosition, trackWidgetSurfaceMonitorAttachment } from '../../utils/widget';
import { timeout } from 'ags/time';
import { Window } from '../Window';
import { Astal } from 'ags/gtk4';
import { Align, Offset, Placement } from '../../types/common';
import cn from 'classnames';
import { TransitionOptions } from '../../types/widget';
import { Revealer } from '../Revealer';

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
    const [isVisible, setIsVisible] = createState(false);
    const [isRevealed, setIsRevealed] = createState(false);
    const [elementPosition, setElementPosition] = createState({ top: 0, left: 0 });
    const [contentWidth, setContentWidth] = createState(0);

    const contentContainerCss = createComputed(get => `min-width: ${get(contentWidth)}px;`);
    const contentOrientation = createComputed(get => {
        const popupPlacement = get(toAccessor(placement));

        if (popupPlacement === Placement.TOP || popupPlacement === Placement.BOTTOM) {
            return Gtk.Orientation.VERTICAL;
        }

        return Gtk.Orientation.HORIZONTAL;
    });

    let contentContainerRef: Gtk.Box | null = null;
    const arrowSize = 12;

    toAccessor(isRootMounted).subscribe(() => {
        if (unpackAccessor(isRootMounted) === false) {
            setIsRevealed(false);
            setIsOpened(false);
        }
    });

    const onWindowVisible = () => {
        const anchorElement = unpackAccessor(anchorRef);

        if (!anchorElement || !contentContainerRef) {
            return;
        }

        trackWidgetSurfaceMonitorAttachment(anchorElement, () => {
            if (!anchorElement || !contentContainerRef) {
                return;
            }

            const anchorBounds = anchorElement.compute_bounds(anchorElement)[1];
            const contentContainerBounds = contentContainerRef.compute_bounds(contentContainerRef)[1];

            const anchorGeometry = {
                width: anchorBounds.get_width(), height: anchorBounds.get_height()
            };
            const contentContainerGeometry = {
                width: contentContainerBounds.get_width(), height: contentContainerBounds.get_height()
            };

            const { top: elementTop, left: elementLeft } = getWidgetAnchoredPosition({
                anchor: anchorElement,
                widget: contentContainerRef,
                placement: unpackAccessor(placement),
                alignment: unpackAccessor(align),
                offset: unpackAccessor(anchorOffset)
            });

            setElementPosition({
                top: elementTop,
                left: elementLeft,
            });
            setContentWidth(Math.max(anchorGeometry.width + 1, contentContainerGeometry.width));
            setIsVisible(true);
        });
    };

    const toggleOpen = (args?: { shouldOpen?: boolean }) => {
        const shouldOpen = args?.shouldOpen ?? !unpackAccessor(isOpened);

        if (!shouldOpen) {
            setIsRevealed(false);
            timeout(unpackAccessor(transitionOptions)?.duration ?? 0, () => {
                setIsOpened(false);
                setIsVisible(false);
            });
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

    const FloatContent = () => (
        <Gtk.Box
            $={self => (contentContainerRef = self)}
            orientation={contentOrientation}
            hexpand
            css={contentContainerCss}
        >
            <With value={toAccessor(placement)}>
                {(placement) => placement === Placement.TOP || placement === Placement.LEFT ? floatContent({ toggleOpen }) : null}
            </With>

            <box homogeneous css={`--floated__arrow-size: ${arrowSize}px;`}>
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
        classes={{ root: updateAccessor(isVisible, isVisible => cn('floated', isVisible && 'floated_visible')) }}
        isVisible={isOpened}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
        canTarget
        margin={{
            top: elementPosition((v) => v.top),
            left: elementPosition((v) => (
                v.left
                + (placement === Placement.LEFT ? arrowSize : 0)
                + (placement === Placement.RIGHT ? -arrowSize : 0)
            )),
        }}
        layer={Astal.Layer.TOP}
        keymode={Astal.Keymode.ON_DEMAND}
        onActive={({ window }) => !window.isActive && toggleOpen({ shouldOpen: false })}
        onVisible={onWindowVisible}
    >
        <With value={toAccessor(transitionOptions)}>
            {(transitionOptions: TransitionOptions) => transitionOptions.enabled
                ? (
                    <Revealer
                        isRevealed={isRevealed}
                        transitionType={transitionOptions.type ?? Gtk.RevealerTransitionType.CROSSFADE}
                        transitionDuration={transitionOptions.duration ?? 0}
                        hexpand
                    >
                        {() => FloatContent()}
                    </Revealer>
                ) : FloatContent()
            }
        </With>
    </Window>;

    return props.children({ toggleOpen });
}
