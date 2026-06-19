import app from 'ags/gtk4/app';
import Gtk from 'gi://Gtk';
import { IPopupButton, PopupButton } from '../../shared';
import { Classes, UnpackAcessor } from '../../types/utils';
import { handleRequest } from '../../rpc/utils';
import { getIsSetOutputsCommandRequest } from '../../rpc';
import { createComputed, createEffect, createState, onCleanup } from 'gnim';
import { Output, OutputPowerMode } from '../../types/system';
import { Display } from '../../models/Display';
import { ScrollProgressOverlay } from '../../shared/ScrollProgressOverlay';
import { Direction } from '../../types/common';
import { IpcSocket } from '../../models/IpcSocket';
import { handleEvent } from '../../ipc/utils';
import { getIsOutputsChangedIpcEvent } from '../../ipc';

export interface IDpmsPopupButton extends Pick<IPopupButton, 'isRootMounted' | 'halign' | 'vexpand' | 'hexpand'> {
    classes?: Classes<'root'>;
}

const ipcSocket = new IpcSocket();

export function DpmsPopupButton(props: IDpmsPopupButton) {
    const display = new Display();

    const [outputs, setOutputs] = createState<Output[]>([]);

    createEffect(async () => {
        setOutputs(await display.getOutputsInfo());
    });

    const outputsListenerDispose = ipcSocket.listen(handleEvent(getIsOutputsChangedIpcEvent, async (payload) => {
        setOutputs(await display.getOutputsInfo({ state: payload }));
    }));

    app.connect('request', handleRequest(getIsSetOutputsCommandRequest, async (request) => {
        setOutputs(request.system.outputs);
    }));

    onCleanup(() => {
        outputsListenerDispose();
    });

    const items = createComputed<(UnpackAcessor<IPopupButton<Output>['items']>[0])[]>(
        (get) => get(outputs).map(({ name, power, brightness }) => ({
            name,
            value: name,
            icon: <label label={power === OutputPowerMode.ON ? '󰨇' : '󰍹'} />,
            wrapper: ({ children }) => (
                <ScrollProgressOverlay
                    direction={Direction.FORWARD}
                    value={Number.parseInt((brightness?.percentage ?? '0'))}
                    onChange={async (value) => {
                        if (!brightness) {
                            return;
                        }

                        const currentValue = brightness.max * value / 100;

                        if (currentValue <= brightness.min || currentValue >= brightness.max) {
                            return;
                        }

                        display.setBrightness({ value: `${value}%`, device: brightness?.device });

                        // const outputs = await display.getOutputsInfo();
                        // broadcastRequest(getSetOutputsCommandRequest(outputs));
                    }}
                >
                    {children}
                </ScrollProgressOverlay>
            )
        })));

    return (
        <PopupButton
            {...props}
            onSelect={({ value }) => display.toggleOutputState({ name: value })}
            onToggle={async isOpened => isOpened && setOutputs(await display.getOutputsInfo())}
            items={items}
        >
            <label label="󰍺" hexpand halign={Gtk.Align.CENTER} />
        </PopupButton>
    );
}
