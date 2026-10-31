import GLib from 'gi://GLib?version=2.0';
import { APP_ENV_PREFIX } from '@/constants/os';
import { LogLevel } from '@/types/log';

export const env = {
    LOG_LEVEL: Number.parseInt(GLib.getenv(`${APP_ENV_PREFIX}_LOG_LEVEL`) ?? `${LogLevel.BASE}`),
};
