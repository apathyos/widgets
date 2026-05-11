import AstalNetwork from 'gi://AstalNetwork?version=0.1';
import { SystemComponent } from '../base/SystemComponent';
import {
    NetworkAccessPoint,
    NetworkActiveConnection,
    NetworkConnection,
    NetworkConnectionType,
    NetworkDevice,
    NetworkRemoteConnection
} from '../../types/system';

export abstract class Network extends SystemComponent {
    constructor(protected NetworkService: AstalNetwork.Network) {
        super();
    }

    abstract getDevice(): NetworkDevice | null;
    abstract getIsEnabled(): boolean;
    abstract toggleEnabled(args?: { value?: boolean }): void;
    abstract getIsConnected(): boolean;
    abstract toggleConnected(args?: { connection?: NetworkConnection; value?: boolean }): void;
    abstract getConnections(): NetworkConnection[];
    abstract getActiveConnections(): NetworkActiveConnection[];

    getActiveConnection(args: {
        connection: NetworkConnection;
    }) {
        const { connection } = args;

        const lastUsedProfile = this.getConnectionLastUsedProfile({ connection });

        if (!lastUsedProfile) {
            return null;
        }

        const client = this.NetworkService.get_client();
        return client.get_active_connections().find(c => c.uuid === lastUsedProfile.get_uuid()) ?? null;
    }

    getIsConnectionActive(args: {
        connection: NetworkConnection;
    }) {
        const { connection } = args;
        return !!this.getActiveConnection({ connection });
    }

    getIsRemoteConnection(connection: NetworkConnection): connection is NetworkRemoteConnection {
        return 'need_secrets' in connection;
    }

    getIsAccessPoint(connection: NetworkConnection): connection is NetworkAccessPoint {
        return 'strength' in connection;
    }

    protected async toggleConnection(args: {
        connection: NetworkConnection;
        value?: boolean;
    }) {
        const { connection, value } = args;

        const client = this.getClient();
        const oldValue = this.getIsConnectionActive({ connection });
        const shouldActivate = value ?? !oldValue;

        if (oldValue === shouldActivate) {
            return;
        }

        try {
            await new Promise<void>(resolve => {
                if (shouldActivate) {
                    const lastUsedProfile = this.getConnectionLastUsedProfile({ connection });
                    const activationMethod = (lastUsedProfile
                        ? client.activate_connection_async
                        : client.add_and_activate_connection_async
                    ).bind(client);

                    activationMethod(
                        lastUsedProfile,
                        this.getDevice(),
                        lastUsedProfile ? null : connection.get_path(),
                        null,
                        (_, res) => {
                            try {
                                client.activate_connection_finish(res);
                                resolve();
                            } catch { }
                        }
                    );
                } else {
                    const activeConnection = this.getActiveConnection({ connection });

                    activeConnection && client.deactivate_connection_async(
                        activeConnection,
                        null,
                        (_, res) => {
                            client.deactivate_connection_finish(res);
                            resolve();
                        }
                    );
                }
            });
        } catch {}
    }

    protected getClient() {
        return this.NetworkService.get_client();
    }

    protected getConnectionsByType<T extends NetworkConnectionType, A extends boolean>(args: {
        type: T;
        onlyActive?: A;
    }): NetworkConnection<T, A>[] {
        const { type, onlyActive } = args;

        const client = this.getClient();
        const activeConnections = client.get_active_connections();
        let connections: NetworkConnection[] = [];

        if (onlyActive) {
            connections = activeConnections.filter(connection => this.getIsConnectionByType({ type, connection }));
        } else {
            client.get_connections().forEach(connection => {
                if (!this.getIsConnectionByType({ type, connection })) {
                    return;
                }

                const activeConnection = activeConnections.find(ac => ac.get_uuid() === connection.get_uuid());

                connections.push(activeConnection ?? connection);
            });
        }

        return connections.sort(
            (a, b) => (Network.getConnectionTimestamp(b) ?? Infinity) - (Network.getConnectionTimestamp(a) ?? Infinity)
        ) as NetworkConnection<T, A>[];
    }

    protected getIsConnectionByType(args: {
        type: NetworkConnectionType;
        connection: NetworkConnection;
    }) {
        const { type, connection } = args;

        const connectionType = this.getIsAccessPoint(connection)
            ? NetworkConnectionType.WIRELESS
            : connection.get_connection_type();

        switch (type) {
            case NetworkConnectionType.WIRELESS:
                return 'get_setting_wireless' in connection && connection.get_setting_wireless() ||
                    connectionType.includes('wireless');
            case NetworkConnectionType.VPN:
                return connectionType === 'vpn' ||
                    connectionType === 'wireguard' ||
                    'get_setting_vpn' in connection && connection.get_setting_vpn();
            default:
                return false;
        }
    }

    protected getRecentConnection<T extends NetworkConnectionType>(args: {
        type: T;
    }): NetworkConnection<T> | null {
        const { type } = args;

        const connections = this.getConnectionsByType({ type }).sort((a, b) => {
            return (Network.getConnectionTimestamp(b) ?? Infinity) - (Network.getConnectionTimestamp(a) ?? Infinity);
        });

        return connections[0] || null;
    }

    protected getConnectionProfiles(args: {
        connection: NetworkConnection;
    }) {
        const { connection } = args;

        const isAccessPoint = this.getIsAccessPoint(connection);

        return this.getClient().get_connections().filter(
            c => isAccessPoint ? connection.connection_valid(c) : connection.get_uuid() === c.get_uuid()
        );
    }

    protected getConnectionLastUsedProfile(args: {
        connection: NetworkConnection;
    }): NetworkRemoteConnection | null {
        const { connection } = args;

        return this.getConnectionProfiles({ connection }).sort(
            (a, b) => (Network.getConnectionTimestamp(b) ?? Infinity) - (Network.getConnectionTimestamp(a) ?? Infinity)
        )[0] ?? null;
    }

    static getConnectionTimestamp(connection: NetworkConnection) {
        return 'get_setting_connection' in connection ? connection.get_setting_connection().timestamp : null;
    }
}
