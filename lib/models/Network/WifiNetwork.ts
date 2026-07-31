import { Icon } from '../../types/icon';
import { NetworkActiveConnection, NetworkConnection, NetworkConnectionType } from '../../types/system';
import { Network } from './Network';

export class WifiNetwork extends Network {
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

    getConnectionNeedSecrets(args: {
        connection: NetworkConnection;
    }) {
        const { connection } = args;

        const isAccessPoint = this.getIsAccessPoint(connection);

        return this.NetworkService.wifi?.accessPoints.find(
            ap => isAccessPoint ? ap.get_bssid() === connection.get_bssid() : false
        )?.requiresPassword ?? true;
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
}
