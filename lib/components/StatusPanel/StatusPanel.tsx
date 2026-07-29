import { Revealer, Surface } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';
import {
    StatusPanelButtonsSection,
    StatusPanelControlsSection,
    StatusPanelPlayerSection,
    StatusPanelSlidersSection,
    StatusPanelTraySection,
} from '../../widgets';
import {
    STATUS_PANEL_HEIGHT_MULTIPLIER,
    STATUS_PANEL_WIDTH,
    TOP_BAR_HEIGHT,
} from '../../constants/widget';
import { createComputed } from 'gnim';
import { Spacing } from '../../types/common';

export interface IStatusPanel {
    ref?: (self: Gtk.Revealer) => void;
    isOpened: PropertyValue<boolean>;
    windowHeight: PropertyValue<number>;
    windowWidth: PropertyValue<number>;
    classes?: Classes<'root' | 'revealer'>;
}

export function StatusPanel(props: IStatusPanel) {
    const { ref, isOpened, windowHeight, classes } = props;

    return (
        <Revealer
            ref={ref}
            classes={{
                root: updateAccessor(classes?.revealer, (revealer) => cn(revealer, 'status-panel-revealer')),
            }}
            isRevealed={isOpened}
            transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
            margin={{
                top: toAccessor(windowHeight)((v) => (v - v * STATUS_PANEL_HEIGHT_MULTIPLIER) / 2 - TOP_BAR_HEIGHT),
            }}
            css={createComputed(
                (get) => `min-height: ${get(toAccessor(windowHeight)) * STATUS_PANEL_HEIGHT_MULTIPLIER}px;`,
            )}
        >
            <Surface
                css={`
                    min-width: ${STATUS_PANEL_WIDTH}px;
                    margin-right: ${Spacing.XL}px;
                `}
                classes={{
                    root: updateAccessor(
                        classes?.root,
                        (root) => cn(root, 'status-panel', isOpened && 'status-panel_opened')
                    )
                }}
            >
                <box orientation={Gtk.Orientation.VERTICAL} spacing={Spacing.L}>
                    {/* <StatusPanelTogglersSection /> */}
                    <StatusPanelSlidersSection isRootMounted={isOpened} />
                    <StatusPanelButtonsSection isRootMounted={isOpened} />
                    <StatusPanelPlayerSection />
                    <box vexpand>
                        <StatusPanelTraySection />
                    </box>
                    <box valign={Gtk.Align.END}>
                        <StatusPanelControlsSection isRootMounted={isOpened} />
                    </box>
                </box>
            </Surface>
        </Revealer>
    );
}
