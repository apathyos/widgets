import GLib from 'gi://GLib';
import { CpuProfile, GpuMode } from '../types/system';
import { INotification, NotificationCategory } from '@/types/notification';
import Notifd from 'gi://AstalNotifd?version=0.1';
import NM from 'gi://NM?version=1.0';

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

export const getConnectionFromVariant = (variant: GLib.Variant) => {
    return NM.SimpleConnection.new_from_dbus(variant);
};

export const getConnectionSsidFromVariant = (variant: GLib.Variant) => {
    const connection = getConnectionFromVariant(variant);
    const wireless = connection.get_setting_wireless();
    const security = connection.get_setting_wireless_security();

    security?.set_secret_flags('psk', NM.SettingSecretFlags.NOT_SAVED);

    const ssidBytes = wireless?.get_ssid();

    const data = ssidBytes?.get_data();

    if (!data) {
        return null;
    }

    return NM.utils_ssid_to_utf8(data);
};
