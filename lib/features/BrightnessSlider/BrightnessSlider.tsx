import app from 'ags/gtk4/app';
import { SymbolSlider } from '../../shared';
import { Display } from '../../models/Display';
import { createEffect, createState } from 'gnim';
import { Classes } from '../../types/utils';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { handleRequest } from '../../rpc/utils';
import { getIsSetOutputsCommandRequest } from '../../rpc';

export interface IBrightnessSlider {
    classes?: Classes<'root' | 'label'>;
}

export function BrightnessSlider(props: IBrightnessSlider) {
    const { classes } = props;

    const display = new Display();

    const [currentBrightness, setCurrentBrightness] = createState(0);
    const [minBrightness, setMinBrightness] = createState(0);
    const [maxBrightness, setMaxBrightness] = createState(0);

    createEffect(async () => {
        setMinBrightness(display.getMinBrightness());
        setMaxBrightness(await display.getMaxBrightness());
        setCurrentBrightness(await display.getDeviceBrightness());
    });

    app.connect('request', handleRequest(getIsSetOutputsCommandRequest, async () => {
        // setCurrentBrightness(await display.getDeviceBrightness());
    }));

    const brightnessIcon = display.getBrightnessIcon();

    return (
        <SymbolSlider
            min={minBrightness}
            max={maxBrightness}
            value={currentBrightness}
            onClick={async () => {
                display.setBrightness({ value: String(unpackAccessor(minBrightness)) });
                setCurrentBrightness(unpackAccessor(minBrightness));
                // broadcastRequest(getSetOutputsCommandRequest(await display.getOutputsInfo()));
            }}
            onChange={async ({ event: { value } }) => {
                display.setBrightness({ value: String(unpackAccessor(value)) });
                setCurrentBrightness(value);
                // broadcastRequest(getSetOutputsCommandRequest(await display.getOutputsInfo()));
            }}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'brightness-slider')),
            }}
        >
            <label
                class={updateAccessor(classes?.label, (label) => cn(label, 'brightness-slider__label'))}
                label={brightnessIcon.icon}
            />
        </SymbolSlider>
    );
}
