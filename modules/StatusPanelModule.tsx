import app from 'ags/gtk4/app';
import { StatusPanel } from '../lib/components';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import { createComputed, createState } from 'gnim';
import { timeout, Timer } from 'ags/time';
import { STATUS_PANEL_HEIGHT_MULTIPLIER, TOP_BAR_HEIGHT, TRANSITION_NORMAL } from '../lib/constants/widget';
import { Revealer, Window } from '../lib/shared';
import { handleRequest } from '../lib/rpc/utils';
import {
    getIsSetStatusPanelOpenedCommandRequest,
    getIsStatusPanelOpenedQueryRequest,
    sendStatusPanelOpenedQueryResponse
} from '../lib/rpc';
import { unpackAccessor } from '../lib/utils/misc';
import { Spacing } from '@/types/common';

export function StatusPanelModule() {
    const { TOP, RIGHT } = Astal.WindowAnchor;

    const [activeMonitor, setActiveMonitor] = createState<Gdk.Monitor | null>(null);
    const [isPanelVisible, setIsPanelVisible] = createState(false);
    const [isPanelOpened, setIsPanelOpened] = createState(false);

    const activeMonitorHeight = createComputed(get => get(activeMonitor)?.geometry.height ?? 0);
    const isRevealed = createComputed(get => !!(get(isPanelOpened) && get(activeMonitor)));
    let panelVisibilityTimer: Timer | null = null;

    app.connect(
        'request',
        handleRequest(
            getIsSetStatusPanelOpenedCommandRequest,
            async (request) => {
                const { statusPanel: { isOpened, instant } } = request;

                panelVisibilityTimer?.cancel();

                if (isOpened) {
                    setIsPanelVisible(true);
                    setIsPanelOpened(true);
                } else {
                    setIsPanelOpened(false);

                    if (instant) {
                        setIsPanelVisible(false);
                    } else {
                        const timer = timeout(TRANSITION_NORMAL, () => {
                            setIsPanelVisible(false);
                        });

                        panelVisibilityTimer = timer;
                    }
                }
            },
            { respondWith: () => String(unpackAccessor(isPanelOpened)) },
        ),
    );

    app.connect(
        'request',
        handleRequest(getIsStatusPanelOpenedQueryRequest, async () => undefined, {
            respondWith: () => sendStatusPanelOpenedQueryResponse(unpackAccessor(isPanelOpened)),
        }),
    );

    return (
        <Window
            isVisible={isPanelVisible}
            anchor={TOP | RIGHT}
            layer={Astal.Layer.TOP}
            keymode={Astal.Keymode.ON_DEMAND}
            onVisible={({ monitor }) => setActiveMonitor(monitor)}
        >
            <Revealer
                isRevealed={isRevealed}
                transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                margin={{
                    top: activeMonitorHeight((v) => Math.max(
                        0,
                        Math.round((v - v * STATUS_PANEL_HEIGHT_MULTIPLIER) / 2 - TOP_BAR_HEIGHT)
                    )),
                }}
                css={createComputed((get) => `min-height: ${get(activeMonitorHeight) * STATUS_PANEL_HEIGHT_MULTIPLIER}px;`)}
            >
                {() => (
                    <box marginEnd={isRevealed(v => v ? Spacing.L : 0)}>
                        <StatusPanel isOpened={isRevealed} />
                    </box>
                )}
            </Revealer>
        </Window>
    );
}
