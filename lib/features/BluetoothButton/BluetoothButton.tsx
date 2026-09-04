import { createComputed, createState } from 'gnim';
import { ISymbolRevealButton, SymbolRevealButton } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import { getStringList } from '../../utils/strings';
import BluetoothModule from 'gi://AstalBluetooth?version=0.1';
import cn from 'classnames';
import { Bluetooth } from '../../models/Bluetooth';

const BluetoothService = BluetoothModule.get_default();

export interface IBluetoothButton {
    classes?: ISymbolRevealButton['classes'] & Classes<'icon'>;
}

export function BluetoothButton(props: IBluetoothButton) {
    const { classes } = props;

    const bluetooth = new Bluetooth(BluetoothService);

    const [isConnected, setIsConnected] = createState(bluetooth.getIsConnected());
    const [devices, setDevices] = createState(bluetooth.getDevices());
    const [icon, setIcon] = createState(bluetooth.getIcon());

    BluetoothService.connect('notify', () => {
        setIsConnected(bluetooth.getIsConnected());
        setDevices(bluetooth.getDevices());
        setIcon(bluetooth.getIcon());
    });

    const label = createComputed((get) => {
        return get(isConnected) ? getStringList(get(devices).filter(d => d.connected), item => item.alias) : '';
    });

    return (
        <SymbolRevealButton
            onClick={() => bluetooth.toggleEnabled()}
            label={label}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, (root) => cn(root, 'bluetooth-button')),
            }}
        >
            <label
                class={updateAccessor(classes?.icon, (icon) => cn(icon, 'bluetooth-button__icon'))}
                label={icon(v => v.icon)}
            />
        </SymbolRevealButton>
    );
}
