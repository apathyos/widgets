import { Icon } from '../../types/icon';
import { NetworkConnection, NetworkConnectionType } from '../../types/system';
import { Network } from './Network';

export class VpnNetwork extends Network {
    getDevice() {
        return null;
    }

    getIsEnabled() {
        return this.getIsConnected();
    }

    async toggleEnabled(args?: { value?: boolean; }) {
        return this.toggleConnected(args);
    }

    getIsConnected(): boolean {
        return !!this.getActiveConnections().length;
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
        return this.getConnectionsByType({ type: NetworkConnectionType.VPN });
    }

    getActiveConnections() {
        return this.getConnectionsByType({
            type: NetworkConnectionType.VPN,
            onlyActive: true
        });
    }

    getIcon() {
        const isConnected = this.getIsConnected();
        const icon: Icon = { icon: '' };

        if (isConnected) {
            icon.icon = '󰱓';
        } else {
            icon.icon = '󰲛';
        }

        return icon;
    }

    private async toggleConnectedState(args: { value?: boolean }) {
        const { value = !this.getIsConnected() } = args;

        const activeConnections = this.getActiveConnections();

        if (value && activeConnections.length || !value && !activeConnections.length) {
            return;
        }

        if (activeConnections.length) {
            for (const connection of activeConnections) {
                await this.toggleConnection({ connection, value: false });
            }
        } else {
            const recentConnection = this.getRecentConnection({ type: NetworkConnectionType.VPN });
            recentConnection && await this.toggleConnection({ connection: recentConnection, value: true });
        }
    }
}
