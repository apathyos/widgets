import { createComputed, createState } from 'gnim';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import Network from 'gi://AstalNetwork?version=0.1';
import { Classes } from '../../types/utils';
import { getStringList, unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { VpnNetwork } from '../../models/Network';

const NetworkService = Network.get_default();

export interface IVpnDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function VpnDropdownButton(props: IVpnDropdownButton) {
    const { isRootMounted, classes } = props;

    const vpn = new VpnNetwork(NetworkService);

    const [connections, setConnections] = createState(vpn.getConnections());
    const [isConnected, setIsConnected] = createState(vpn.getIsConnected());
    const [icon, setIcon] = createState(vpn.getIcon());

    NetworkService.client.connect('notify', () => {
        setConnections(vpn.getConnections());
        setIsConnected(vpn.getIsConnected());
        setIcon(vpn.getIcon());
    });

    const label = createComputed((get) => {
        const connected = get(isConnected);
        const activeConnections = vpn.getActiveConnections();

        return connected ? getStringList(activeConnections, item => item.get_id()) : 'not connected';
    });

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={label}
            isRootMounted={isRootMounted}
            onClick={() => vpn.toggleConnected()}
            onSelect={async (item) => {
                const connection = unpackAccessor(connections).find(c => c.get_uuid() === item.value);

                connection && await vpn.toggleConnected({ connection });
                setConnections(vpn.getConnections());
            }}
            onToggle={(isOpened) => {
                if (isOpened) {
                    setConnections(vpn.getConnections());
                }
            }}
            items={connections(v => v.map((connection) => ({
                name: connection.get_id(),
                value: connection.get_uuid(),
                isActive: vpn.getIsConnected() && vpn.getIsConnectionActive({ connection })
            })))}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'vpn-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'vpn-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'vpn-dropdown-button__label')),
            }}
        />
    );
}
