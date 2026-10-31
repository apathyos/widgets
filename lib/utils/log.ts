import { env } from '@/config/env';
import { LogLevel } from '@/types/log';
import { Any } from '@/types/utils';

export const getWarningLog =
    (params?: { prefix?: string }) =>
    (...args: Any[]) => {
        if (env.LOG_LEVEL < LogLevel.VERBOSE) {
            return;
        }

        const { prefix = '' } = params ?? {};

        console.warn(prefix, ...args);
    };

export const getErrorLog =
    (params?: { prefix?: string }) =>
    (...args: Any[]) => {
        if (env.LOG_LEVEL < LogLevel.BASE) {
            return;
        }

        const { prefix = '' } = params ?? {};

        console.error(prefix, ...args);
    };

export const getDebugLog =
    (params?: { prefix?: string }) =>
    (...args: Any[]) => {
        if (env.LOG_LEVEL < LogLevel.DEBUG) {
            return;
        }

        const { prefix = '' } = params ?? {};

        console.log(prefix, ...args);
    };
