import { createComputed, createState, onCleanup } from 'gnim';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import Network from 'gi://AstalNetwork?version=0.1';
import { Classes } from '../../types/utils';
import {
    getStringFromBytes,
    getStringList,
    stableAccessor,
    toAccessor,
    toMap,
    unpackAccessor,
    updateAccessor
} from '../../utils/misc';
import cn from 'classnames';
import { WifiNetwork } from '../../models/Network';
import { timeout, Timer } from 'ags/time';
import { Delay } from '../../types/common';
import { isNonNullableAccessor } from '@/utils/typeguards';

export interface IWifiDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted' | 'hexpand'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function WifiDropdownButton(props: IWifiDropdownButton) {
    const { isRootMounted, hexpand, classes } = props;

    const NetworkService = Network.get_default();
    const wifi = new WifiNetwork(NetworkService);
    let scanTimer: Timer | null = null;

    const [isEnabled, setIsEnabled] = createState(wifi.getIsEnabled());
    const [connections, setConnections] = createState(toMap(wifi.getAccessPoints() ?? [], p => p.bssid));
    const [activeConnections, setActiveConnections] = createState(wifi.getActiveConnections());
    const [icon, setIcon] = createState(wifi.getIcon());

    const resetConnections = (connections = wifi.getAccessPoints()) => {
        setConnections(toMap(connections ?? [], p => p.bssid));
    };

    const values = stableAccessor(connections, { compose: (connections) => [...connections.keys()] });

    const refresh = () => {
        setIsEnabled(wifi.getIsEnabled());
        resetConnections();
        setActiveConnections(wifi.getActiveConnections());
        setIcon(wifi.getIcon());
    };

    NetworkService.wifi?.connect('notify', refresh);
    NetworkService.client.connect('notify::active-connections', refresh);

    const label = createComputed((get) => {
        const connections = get(activeConnections);

        return get(isEnabled)
            ? connections.length ? getStringList(connections, (item) => item.get_id()) : 'not connected'
            : 'off';
    });

    onCleanup(() => {
        scanTimer?.cancel();
    });

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={label}
            values={values}
            isRootMounted={isRootMounted}
            hexpand={hexpand}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'wifi-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'wifi-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'wifi-dropdown-button__label')),
            }}
            onClick={async () => {
                wifi.toggleEnabled();
                scanTimer?.cancel();
            }}
            onSelect={async (item) => {
                const connection = unpackAccessor(connections)?.get(item.value);

                connection && await wifi.toggleConnected({ connection });
                refresh();
            }}
            onToggle={(isOpened) => {
                if (isOpened) {
                    wifi.enableScanning();
                    refresh();

                    scanTimer = timeout(Delay.L, function rescan() {
                        refresh();
                        scanTimer = timeout(Delay.L, rescan);
                    });
                } else {
                    scanTimer?.cancel();
                }
            }}
            getItem={value => {
                const connection = createComputed(get => get(toAccessor(connections))?.get(value));

                if (!isNonNullableAccessor(connection)) {
                    return null;
                }

                return {
                    name: connection(v => getStringFromBytes(v.ssid)),
                    value: unpackAccessor(connection).bssid,
                    icon: (
                        <box class="wifi-dropdown-button__item-icon">
                            <label label={connection(connection => wifi.getConnectionNeedSecrets({ connection }) ? '' : '')} />
                        </box>
                    ),
                    isActive: connection(connection => wifi.getIsConnected() && wifi.getIsConnectionActive({ connection }))
                };
            }}
        />
    );
}
