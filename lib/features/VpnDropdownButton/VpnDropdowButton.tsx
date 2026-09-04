import { createComputed, createState } from 'gnim';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import Network from 'gi://AstalNetwork?version=0.1';
import { Classes } from '../../types/utils';
import { stableAccessor, toMap, unpackAccessor, updateAccessor } from '../../utils/misc';
import { getStringList } from '../../utils/strings';
import cn from 'classnames';
import { VpnNetwork } from '../../models/Network';
import { isNonNullableAccessor } from '@/utils/typeguards';

const NetworkService = Network.get_default();

export interface IVpnDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted' | 'hexpand'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function VpnDropdownButton(props: IVpnDropdownButton) {
    const { isRootMounted, hexpand, classes } = props;

    const vpn = new VpnNetwork(NetworkService);

    const [connections, setConnections] = createState(toMap(vpn.getConnections(), c => c.get_uuid()));
    const [isConnected, setIsConnected] = createState(vpn.getIsConnected());
    const [icon, setIcon] = createState(vpn.getIcon());

    const resetConnections = (connections = vpn.getConnections()) => {
        setConnections(toMap(connections, c => c.get_uuid()));
    };

    const values = stableAccessor(connections, { compose: connections => [...connections.keys()] });

    NetworkService.client.connect('notify', () => {
        resetConnections();
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
            values={values}
            isRootMounted={isRootMounted}
            hexpand={hexpand}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'vpn-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'vpn-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'vpn-dropdown-button__label')),
            }}
            getItem={value => {
                const connection = connections(v => v.get(value));

                if (!isNonNullableAccessor(connection)) {
                    return null;
                }

                return {
                    name: connection(v => v.get_id()),
                    value: unpackAccessor(connection).get_uuid(),
                    isActive: connection(connection => vpn.getIsConnected() && vpn.getIsConnectionActive({ connection }))
                };
            }}
            onClick={() => vpn.toggleConnected()}
            onSelect={async (item) => {
                const connection = unpackAccessor(connections).get(item.value);

                connection && await vpn.toggleConnected({ connection });
                resetConnections();
            }}
            onToggle={(isOpened) => {
                if (isOpened) {
                    resetConnections();
                }
            }}
        />
    );
}
