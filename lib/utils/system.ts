import GLib from 'gi://GLib';
import { CpuProfile, GpuMode } from '../types/system';

export const toGpuMode = (mode: string) => {
    switch (mode) {
        case 'hybrid':
            return GpuMode.HYBRID;
        case 'nvidia':
            return GpuMode.NVIDIA;
        default:
            return GpuMode.INTEGRATED;
    }
};

export const getCpuProfileDisplayValue = (profile: CpuProfile) => {
    return profile.replace('apathyos-', '');
};

export const getSortedCpuProfilesList = (profiles: CpuProfile[]) => {
    const weights = {
        [CpuProfile.QUIET]: 1,
        [CpuProfile.BALANCED]: 2,
        [CpuProfile.PERFORMANCE]: 3,
    };

    return profiles.toSorted((a, b) => weights[a] - weights[b]);
};

export const getXDGSessionId = () => {
    const sessionId = GLib.getenv('XDG_SESSION_ID');

    if (!sessionId) {
        throw new Error(
            'XDG_SESSION_ID is missing; cannot determine the logind session',
        );
    }

    return sessionId;
};

export const getSystemLocale = () => {
    return (
        GLib.getenv('LC_ALL') ??
        GLib.getenv('LC_MESSAGES') ??
        GLib.getenv('LANG') ??
        'C'
    );
};
