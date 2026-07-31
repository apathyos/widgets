import { createComputed, createState, onCleanup } from 'gnim';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import Network from 'gi://AstalNetwork?version=0.1';
import { Classes } from '../../types/utils';
import { getStringFromBytes, getStringList, unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { WifiNetwork } from '../../models/Network';
import { timeout, Timer } from 'ags/time';
import { Delay } from '../../types/common';

export interface IWifiDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function WifiDropdownButton(props: IWifiDropdownButton) {
    const { isRootMounted, classes } = props;

    const NetworkService = Network.get_default();
    const wifi = new WifiNetwork(NetworkService);
    let scanTimer: Timer | null = null;

    const [isEnabled, setIsEnabled] = createState(wifi.getIsEnabled());
    const [connections, setConnections] = createState(wifi.getAccessPoints());
    const [activeConnections, setActiveConnections] = createState(wifi.getActiveConnections());
    const [icon, setIcon] = createState(wifi.getIcon());

    const refresh = () => {
        setIsEnabled(wifi.getIsEnabled());
        setConnections(wifi.getAccessPoints());
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
            isRootMounted={isRootMounted}
            onClick={async () => {
                wifi.toggleEnabled();
                scanTimer?.cancel();
            }}
            onSelect={async (item) => {
                const connection = unpackAccessor(connections)?.find(c => c.get_bssid() === item.value);

                connection && await wifi.toggleConnected({ connection });
                refresh();
            }}
            onToggle={(isOpened) => {
                if (isOpened) {
                    wifi.enableScanning();
                    refresh();

                    scanTimer = timeout(Delay.L, function rescan() {
                        refresh();
                        timeout(Delay.L, rescan);
                    });
                } else {
                    scanTimer?.cancel();
                }
            }}
            items={connections((v) => v?.map((connection) => ({
                name: getStringFromBytes(connection.get_ssid()),
                value: connection.get_bssid(),
                icon: (
                    <box class="wifi-dropdown-button__item-icon">
                        {wifi.getConnectionNeedSecrets({ connection }) ? '' : null}
                    </box>
                ),
                isActive: wifi.getIsConnected() && wifi.getIsConnectionActive({ connection })
            })) ?? [])}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'wifi-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'wifi-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'wifi-dropdown-button__label')),
            }}
        />
    );
}
