import { createSubprocess, execAsync } from 'ags/process';
import { Level } from '../../types/common';
import { BrightessDevice, Output, OutputPowerMode } from '../../types/system';
import { OutputInfoState } from '../../types/ipc';
import { IPC } from '../../constants/os';
import { BACKLIGHT_DEVICE, BACKLIGHT_DEVICES } from '../../constants/system';

export class Display {
    getMinNightShiftLevel() {
        return 3400;
    }

    getMaxNightShiftLevel() {
        return 6500;
    }

    getCurrentNightShiftLevel() {
        return createSubprocess(0, ['sh', '-c', '$_APTH_BIN/system/display/get_nightshift'], (v) => +v);
    }

    setNightShiftLevel(args: { value: number }) {
        const { value } = args;

        execAsync(['sh', '-c', `$_APTH_BIN/system/display/set_night_shift ${value}`]);
    }

    getFocusedMonitorName() {
        return execAsync(['sh', '-c', "$_APTH_WM_CONFIG/bin/statusbar/get_active_output | jq -r '.name'"]);
    }

    async getDeviceBrightness() {
        try {
            return +(await execAsync(['sh', '-c', `brightnessctl -d ${BACKLIGHT_DEVICE} g`]));
        } catch {
            return +(await execAsync(['sh', '-c', 'brightnessctl g']));
        }
    }

    async getBrightness() {
        const devices = (await execAsync(['sh', '-c', 'brightnessctl -mlc backlight'])).split('\n').map(s => s.split(',')).reduce(
            (acc, [device, cl, brightness, percentage, max]) => {
                acc[device] = {
                    device,
                    output: BACKLIGHT_DEVICES[device],
                    class: cl,
                    value: +brightness,
                    percentage,
                    max: +max,
                };

                return acc;
            },
            {} as Record<string, BrightessDevice>
        );

        return devices;
    }

    async setBrightness(args: { value: string, device?: string }) {
        const { value, device = BACKLIGHT_DEVICE } = args;

        try {
            await execAsync(['sh', '-c', `brightnessctl -d ${device} s ${value}`]);
        } catch {
            await execAsync(['sh', '-c', `brightnessctl s ${value}`]);
        }
    }

    async getMaxBrightness() {
        try {
            return +(await execAsync(['sh', '-c', `brightnessctl -d ${BACKLIGHT_DEVICE} m`]));
        } catch {
            return +(await execAsync(['sh', '-c', 'brightnessctl m']));
        }
    }

    getMinBrightness() {
        return 5;
    }

    async getOutputsInfo(args?: {
        state?: OutputInfoState[];
        sort?: boolean;
    }) {
        const { state, sort = true } = args ?? {};

        try {
            let outputsInfo: OutputInfoState[] = state ?? JSON.parse(await execAsync(['sh', '-c', `${IPC} output outputs`]));
            // const brightnesses = Object.values(this.getBrightness());
            const brightnesses: BrightessDevice[] = [];
            const minBrightness = this.getMinBrightness();

            if (sort) {
                outputsInfo = outputsInfo.sort((a, b) => a.name.localeCompare(b.name));
            }

            return outputsInfo.map(output => {
                const brightness = brightnesses.find(b => output.name.startsWith(b.output));

                return this.getOutputInfoFromState.bind(this)({
                    ...output,
                    brightness: brightness ? { ...brightness, min: minBrightness } : undefined
                });
            });
        } catch (e) {
            console.error("Couldn't retrieve outputs info: ", e);
        }

        return [];
    }

    toggleOutputState(args: { name: string; value?: boolean }) {
        const { name, value } = args;
        const newState = typeof value === 'boolean' ? value ? OutputPowerMode.ON : OutputPowerMode.OFF : '';

        return execAsync(['sh', '-c', `$_APATHY_OS/bin/system/toggle-output-state ${name} ${newState}`]);
    }

    arrangeOutputs() {
        return execAsync(['sh', '-c', '$_APATHY_OS/bin/system/arrange-outputs']);
    }

    getNightshiftIcon(args: { currentValue: number }) {
        const { currentValue } = args;

        const min = this.getMinNightShiftLevel();
        const max = this.getMaxNightShiftLevel();
        const mid = min + (max - min) / 2;

        if (currentValue > mid) {
            return { icon: '', level: Level.HIGH };
        }

        return { icon: '', level: Level.LOW };
    }

    getBrightnessIcon() {
        return { icon: '' };
    }

    getOutputInfoFromState(output: OutputInfoState & Pick<Output, 'brightness'>): Output {
        return {
            name: output.name,
            model: output.description,
            power: output.power?.mode,
            brightness: output.brightness,
        };
    }
}
