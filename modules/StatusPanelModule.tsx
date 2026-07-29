import app from 'ags/gtk4/app';
import { StatusPanel } from '../lib/components';
import { Astal, Gdk } from 'ags/gtk4';
import { createState, With } from 'gnim';
import { timeout, Timer } from 'ags/time';
import { TRANSITION_NORMAL } from '../lib/constants/widget';
import { Window } from '../lib/shared';
import { handleRequest } from '../lib/rpc/utils';
import {
    getIsSetStatusPanelOpenedCommandRequest,
    getIsStatusPanelOpenedQueryRequest,
    sendStatusPanelOpenedQueryResponse
} from '../lib/rpc';
import { unpackAccessor } from '../lib/utils/misc';

export function StatusPanelModule() {
    const { TOP, RIGHT } = Astal.WindowAnchor;

    const [activeMonitor, setActiveMonitor] = createState<Gdk.Monitor | null>(null);
    const [isPanelVisible, setIsPanelVisible] = createState(false);
    const [isPanelOpened, setIsPanelOpened] = createState(false);

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
            <With value={isPanelVisible}>
                {isPanelVisible => isPanelVisible ? (
                    <StatusPanel
                        isOpened={isPanelOpened}
                        windowHeight={activeMonitor(v => v?.geometry.height ?? 0)}
                        windowWidth={activeMonitor(v => v?.geometry.width ?? 0)}
                    />
                ) : null}
            </With>
        </Window>
    );
}
