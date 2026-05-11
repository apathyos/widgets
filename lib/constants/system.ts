import { OutputName } from '../types/system';

export const DEFAULT_OUTPUT_NAME = OutputName.EDP_1;
export const BACKLIGHT_DEVICE = 'intel_backlight';

export const BACKLIGHT_DEVICES: Record<string, string> = {
    intel_backlight: 'eDP',
    nvidia_0: 'DP',
};
