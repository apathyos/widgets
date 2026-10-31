import { AP_FLAGS, SECURITY_FLAGS } from '@/constants/system';
import { Icon } from '../../types/icon';
import {
    NetworkActiveConnection,
    NetworkConnection,
    NetworkConnectionType,
    NetworkRemoteConnectionSecurity
} from '../../types/system';
import { Network } from './Network';
import AstalNetwork from 'gi://AstalNetwork?version=0.1';

export class WifiNetwork extends Network {
    constructor(protected NetworkService: AstalNetwork.Network) {
        super(NetworkService);
    }

    getDevice() {
        return this.NetworkService.wifi?.device ?? null;
    }

    getIsEnabled(): boolean {
        return this.NetworkService.wifi?.enabled ?? false;
    }

    toggleEnabled(args?: { value?: boolean; }) {
        const { value } = args ?? {};

        const currentValue = this.getIsEnabled();
        const newValue = value ?? !currentValue;

        this.NetworkService.wifi?.set_enabled(newValue);
    }

    getIsConnected() {
        return !!this.NetworkService.wifi?.activeConnection;
    }

    async toggleConnected(args?: { connection?: NetworkConnection; value?: boolean; }) {
        const { connection, value } = args ?? {};

        if (connection) {
            await this.toggleConnection({ connection, value });
        } else {
            await this.toggleConnectedState({ value });
        }
    }

    getConnections() {
        return this.getConnectionsByType({ type: NetworkConnectionType.WIRELESS });
    }

    getAccessPoints() {
        return this.NetworkService.wifi?.device.accessPoints.sort((a, b) => {
            const aProfile = this.getConnectionLastUsedProfile({ connection: a });
            const bProfile = this.getConnectionLastUsedProfile({ connection: b });

            if (aProfile && !bProfile) {
                return -1;
            }

            if (!aProfile && bProfile) {
                return 1;
            }

            if (aProfile && bProfile) {
                return (Network.getConnectionTimestamp(bProfile) ?? Infinity) -
                    (Network.getConnectionTimestamp(aProfile) ?? Infinity);
            }

            return b.strength - a.strength;
        });
    }

    getRequiresPassword(args: { connection: NetworkConnection; }): boolean {
        const { connection } = args;

        const accessPoint = this.getConnectionAccessPoint({ connection });

        if (!accessPoint) {
            return false;
        }

        const security = WifiNetwork.getRemoteConnectionSecurity({ accessPoint });

        return (
            security === NetworkRemoteConnectionSecurity.WPA_PSK ||
            security === NetworkRemoteConnectionSecurity.SAE ||
            security === NetworkRemoteConnectionSecurity.WEP
        );
    }

    getActiveConnections(): NetworkActiveConnection[] {
        return this.getConnectionsByType({
            type: NetworkConnectionType.WIRELESS,
            onlyActive: true
        }) as NetworkActiveConnection[];
    }

    enableScanning() {
        if (!this.getIsEnabled()) {
            console.error('Can\'t enable scanning: wi-fi is off!');
            return;
        }

        !this.NetworkService.wifi?.get_scanning() && this.NetworkService.wifi?.scan();
    }

    getIcon(): Icon {
        const isConnected = this.getIsConnected();
        const icon: Icon = { icon: '' };

        if (isConnected) {
            icon.icon = '󰖩';
        } else {
            icon.icon = '󰖪';
        }

        return icon;
    }

    private async toggleConnectedState(args: { value?: boolean }) {
        const { value = !this.getIsConnected() } = args;

        const activeConnection = this.NetworkService.wifi?.activeConnection;

        if (value && activeConnection || !value && !activeConnection) {
            return;
        }

        if (activeConnection) {
            await this.toggleConnection({ connection: activeConnection, value: false });
        } else {
            const recentConnection = this.getRecentConnection({ type: NetworkConnectionType.WIRELESS });
            recentConnection && await this.toggleConnection({ connection: recentConnection, value: true });
        }
    }

    private getConnectionAccessPoint(args: {
        connection: NetworkConnection;
    }) {
        const { connection } = args;

        const isAccessPoint = this.getIsAccessPoint(connection);

        if (!isAccessPoint) {
            return null;
        }

        return this.NetworkService.wifi?.accessPoints.find(ap => ap.get_bssid() === connection.get_bssid());
    }

    static getRemoteConnectionSecurity(args: {
        accessPoint: AstalNetwork.AccessPoint,
    }): NetworkRemoteConnectionSecurity {
        const { accessPoint } = args;

        const flags = accessPoint.get_flags();
        const wpa = accessPoint.get_wpa_flags();
        const rsn = accessPoint.get_rsn_flags();

        const security = wpa | rsn;

        if (
            security &
            (
                SECURITY_FLAGS.KEY_MGMT_OWE |
                SECURITY_FLAGS.KEY_MGMT_OWE_TM
            )
        ) {
            return NetworkRemoteConnectionSecurity.OWE;
        }

        if (
            security &
            (
                SECURITY_FLAGS.KEY_MGMT_802_1X |
                SECURITY_FLAGS.KEY_MGMT_EAP_SUITE_B_192
            )
        ) {
            return NetworkRemoteConnectionSecurity.ENTERPISE;
        }

        if (security & SECURITY_FLAGS.KEY_MGMT_SAE) {
            return NetworkRemoteConnectionSecurity.SAE;
        }

        if (security & SECURITY_FLAGS.KEY_MGMT_PSK) {
            return NetworkRemoteConnectionSecurity.WPA_PSK;
        }

        if (
            (flags & AP_FLAGS.PRIVACY) &&
            wpa === SECURITY_FLAGS.NONE &&
            rsn === SECURITY_FLAGS.NONE
        ) {
            return NetworkRemoteConnectionSecurity.WEP;
        }

        return NetworkRemoteConnectionSecurity.OPEN;
    }
}
