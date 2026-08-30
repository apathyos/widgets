import app from 'ags/gtk4/app';
import Gtk from 'gi://Gtk';
import { IPopupButton, PopupButton } from '../../shared';
import { Classes } from '../../types/utils';
import { handleRequest } from '../../rpc/utils';
import { getIsSetOutputsCommandRequest } from '../../rpc';
import { createEffect, createState, onCleanup } from 'gnim';
import { Output, OutputPowerMode } from '../../types/system';
import { Display } from '../../models/Display';
import { ScrollProgressOverlay } from '../../shared/ScrollProgressOverlay';
import { Direction } from '../../types/common';
import { IpcSocket } from '../../models/IpcSocket';
import { handleEvent } from '../../ipc/utils';
import { getIsOutputsChangedIpcEvent } from '../../ipc';
import { stableAccessor, unpackAccessor } from '@/utils/misc';
import { isNonNullableAccessor } from '@/utils/typeguards';

export interface IDpmsPopupButton<P = object> extends Pick<IPopupButton<P>, 'isRootMounted' | 'halign' | 'vexpand' | 'hexpand'> {
    classes?: Classes<'root'>;
}

const ipcSocket = new IpcSocket();

export function DpmsPopupButton<P>(props: IDpmsPopupButton<P>) {
    const display = new Display();

    const [outputs, setOutputs] = createState<Output[]>([]);

    const values = stableAccessor(outputs, { compose: outputs => outputs.map(o => o.name) });

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

    return (
        <PopupButton
            {...props}
            values={values}
            getItem={value => {
                const output = outputs(v => v.find(o => o.name === value));

                if (!isNonNullableAccessor(output)) {
                    return null;
                }

                return {
                    name: output(v => v.name),
                    value: unpackAccessor(output).name,
                    icon: <label label={output(v => v.power === OutputPowerMode.ON ? '󰨇' : '󰍹')} />,
                    wrapper: ({ children }) => (
                        <ScrollProgressOverlay
                            direction={Direction.FORWARD}
                            value={output(v => Number.parseInt((v.brightness?.percentage ?? '0')))}
                            onChange={async (value) => {
                                const brightness = unpackAccessor(output).brightness;

                                if (!brightness) {
                                    return;
                                }

                                const currentValue = brightness.max * value / 100;

                                if (currentValue <= brightness.min || currentValue >= brightness.max) {
                                    return;
                                }

                                display.setBrightness({ value: `${value}%`, device: brightness?.device });
                            }}
                        >
                            {children}
                        </ScrollProgressOverlay>
                    )
                };
            }}
            onSelect={({ value }) => display.toggleOutputState({ name: value })}
            onToggle={async isOpened => isOpened && setOutputs(await display.getOutputsInfo())}
        >
            <label label="󰍺" hexpand halign={Gtk.Align.CENTER} />
        </PopupButton>
    );
}
