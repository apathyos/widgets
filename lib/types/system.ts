import NM from 'gi://NM?version=1.0';

export enum MemoryValue {
    TOTAL = 'MemTotal',
    AVAILABLE = 'MemAvailable',
}

export enum IdleStatus {
    ACTIVE = 'active',
    IDLE = 'idle'
}

export enum NetworkConnectionType {
    WIRELESS = 'wireless',
    VPN = 'vpn'
}

export enum GpuMode {
    INTEGRATED = 'integrated',
    HYBRID = 'hybrid',
    NVIDIA = 'nvidia'
}

export enum OutputName {
    EDP_1 = 'eDP-1',
    EDP_2 = 'eDP-2',
    DP_1 = 'DP-1'
}

export enum OutputPowerMode {
    ON = 'on',
    OFF = 'off'
}

export enum OutputModeState {
    CURRENT = 'current',
    PREFFERED = 'preffered',
}

export enum CpuProfile {
    QUIET = 'apathyos-quiet',
    BALANCED = 'apathyos-balanced',
    PERFORMANCE = 'apathyos-performance'
}

export type NetworkActiveConnection = NM.ActiveConnection;
export type NetworkRemoteConnection = NM.RemoteConnection;
export type NetworkAccessPoint = NM.AccessPoint;

export type NetworkWirelessConnection = NetworkActiveConnection | NetworkRemoteConnection | NetworkAccessPoint;
export type NetworkNonWirelessConnection = NetworkActiveConnection | NetworkRemoteConnection;

export type NetworkConnection<
    T extends NetworkConnectionType = NetworkConnectionType,
    A extends boolean = false
> = A extends true
    ? NetworkActiveConnection
    : T extends NetworkConnectionType.WIRELESS ? NetworkWirelessConnection : NetworkNonWirelessConnection;

export type NetworkWifiDevice = NM.DeviceWifi;
export type NetworkDevice = NetworkWifiDevice;

export type Output = {
    name: string;
    model: string;
    power?: OutputPowerMode;
    brightness?: {
        device: string;
        class: string;
        value: number;
        percentage: string;
        min: number;
        max: number;
    };
};

export type Workspace = {
    id: string | number;
    name: string | number;
    windows: number;
    output: string;
    focused: boolean;
    occupied: boolean;
    urgent: boolean;
};

export type Window = {
    id: string;
    parentId: string | null;
    appId: string;
    title: string;
    activated: boolean;
    fullscreen: boolean;
    maximized: boolean;
    minimized: boolean;
    outputs: string[];
    workspaces: string[];
};

export type BrightessDevice = {
    device: string;
    class: string;
    output: string;
    value: number;
    percentage: string;
    max: number;
};
