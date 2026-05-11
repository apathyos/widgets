import app from 'ags/gtk4/app';
import css from '../style.scss';
import { StatusPanel } from '../lib/components';
import { Astal, Gdk } from 'ags/gtk4';
import { createState, With } from 'gnim';
import { WindowId } from '../lib/types/window';
import { timeout, Timer } from 'ags/time';
import { TRANSITION_NORMAL } from '../lib/constants/widget';
import { Popover } from '../lib/shared';
import { handleRequest, sendRequest } from '../lib/rpc/utils';
import {
    getIsSetStatusPanelOpenedCommandRequest,
    getIsStatusPanelOpenedQueryRequest,
    sendStatusPanelOpenedQueryResponse
} from '../lib/rpc';
import { SetStatusPanelIsOpenedCommandRequest } from '../lib/rpc/types/statusPanel';
import { RequestType } from '../lib/rpc/types';
import { unpackAccessor } from '../lib/utils/misc';

const main = () => {
    try {
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
                    const {
                        statusPanel: { isOpened, instant },
                        shouldNotify,
                    } = request;

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

                    if (shouldNotify) {
                        sendRequest<SetStatusPanelIsOpenedCommandRequest>(WindowId.TOP_BAR, {
                            type: RequestType.COMMAND,
                            statusPanel: { isOpened },
                        });
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

        <Popover
            isVisible={isPanelVisible}
            anchor={TOP | RIGHT}
            layer={Astal.Layer.OVERLAY}
            keymode={Astal.Keymode.ON_DEMAND}
            onMount={({ monitor }) => setActiveMonitor(monitor)}
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
        </Popover>;
    } catch (e) {
        console.error(`${WindowId.STATUS_PANEL} has suddenly crashed! Restarting.`);
        main();
    }
};

app.start({
    css,
    instanceName: WindowId.STATUS_PANEL,
    requestHandler: () => {},
    main,
});
