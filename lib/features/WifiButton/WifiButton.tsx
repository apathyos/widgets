import { ISymbolRevealButton, SymbolRevealButton } from '../../shared';
import { Classes } from '../../types/utils';
import { getStringList, updateAccessor } from '../../utils/misc';
import Network from 'gi://AstalNetwork?version=0.1';
import cn from 'classnames';
import { createComputed, createState } from 'gnim';
import { WifiNetwork } from '../../models/Network';

const NetworkService = Network.get_default();

export interface IWifiButton {
    classes?: ISymbolRevealButton['classes'] & Classes<'icon'>;
}

export function WifiButton(props: IWifiButton) {
    const { classes } = props;

    const wifi = new WifiNetwork(NetworkService);

    const [isConnected, setIsConnected] = createState(wifi.getIsConnected());
    const [icon, setIcon] = createState(wifi.getIcon());

    NetworkService.wifi?.connect('notify', () => {
        setIsConnected(wifi.getIsConnected());
        setIcon(wifi.getIcon());
    });

    const label = createComputed((get) => {
        const connected = get(isConnected);
        const activeConnections = wifi.getActiveConnections();

        return connected ? getStringList(activeConnections, (item) => item.get_id()) : '';
    });

    return (
        <SymbolRevealButton
            onClick={() => wifi.toggleConnected()}
            label={label}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, (root) => cn(root, 'wifi-button')),
            }}
        >
            <label
                class={updateAccessor(classes?.icon, (icon) => cn(icon, 'wifi-button__icon'))}
                label={icon(v => v.icon)}
            />
        </SymbolRevealButton>
    );
}
