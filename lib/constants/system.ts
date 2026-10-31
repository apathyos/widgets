import NM from 'gi://NM?version=1.0';
import { OutputName } from '../types/system';

export const DEFAULT_OUTPUT_NAME = OutputName.EDP_1;
export const BACKLIGHT_DEVICE = 'intel_backlight';

export const BACKLIGHT_DEVICES: Record<string, string> = {
    intel_backlight: 'eDP',
    nvidia_0: 'DP',
};

export const AP_FLAGS = NM['80211ApFlags' as '__80211ApFlags'];
export const SECURITY_FLAGS = NM['80211ApSecurityFlags' as '__80211ApSecurityFlags'];
