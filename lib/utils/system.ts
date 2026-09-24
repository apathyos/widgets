import GLib from 'gi://GLib';
import { CpuProfile, GpuMode } from '../types/system';
import { INotification, NotificationCategory } from '@/types/notification';
import Notifd from 'gi://AstalNotifd?version=0.1';

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
        [CpuProfile.MAX_POWER]: 4,
    };

    return profiles.filter(p => weights[p]).toSorted((a, b) => weights[a] - weights[b]);
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

export const getNotificationWeights = (notification: INotification) => {
    const timestamp = -notification.time;

    const categoryWeights = {
        [NotificationCategory.OSD]: 1,
    };

    const urgencyWeights = {
        [Notifd.Urgency.CRITICAL]: 1,
        [Notifd.Urgency.NORMAL]: 2,
        [Notifd.Urgency.LOW]: 3,
    };

    if (notification.category === NotificationCategory.OSD) {
        return [0, categoryWeights[notification.category], timestamp];
    }

    return [1, urgencyWeights[notification.urgency], timestamp];
};
