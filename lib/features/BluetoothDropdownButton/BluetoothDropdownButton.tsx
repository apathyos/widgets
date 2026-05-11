import { createComputed, createState, onCleanup } from 'gnim';
import { Bluetooth } from '../../models/Bluetooth';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import { Classes } from '../../types/utils';
import { getStringList, unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import BluetoothModule from 'gi://AstalBluetooth?version=0.1';
import { timeout, Timer } from 'ags/time';
import { Delay, Transition } from '../../types/common';

const BluetoothService = BluetoothModule.get_default();

export interface IBluetoothDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function BluetoothDropdownButton(props: IBluetoothDropdownButton) {
    const { isRootMounted, classes } = props;

    const bluetooth = new Bluetooth(BluetoothService);

    const [isEnabled, setIsEnabled] = createState(bluetooth.getIsEnabled());
    const [isConnected, setIsConnected] = createState(bluetooth.getIsConnected());
    const [devices, setDevices] = createState(bluetooth.getDevices());
    const [icon, setIcon] = createState(bluetooth.getIcon());

    let discoveryTimer: Timer | null = null;

    const refresh = () => {
        setIsEnabled(bluetooth.getIsEnabled());
        setIsConnected(bluetooth.getIsConnected());
        setDevices(bluetooth.getDevices());
        setIcon(bluetooth.getIcon());
    };

    BluetoothService.connect('notify', refresh);

    const label = createComputed((get) => {
        return get(isEnabled)
            ? get(isConnected) ? getStringList(get(devices).filter(d => d.connected), item => item.alias) : 'not connected'
            : 'off';
    });

    onCleanup(() => {
        discoveryTimer?.cancel();
    });

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={label}
            onClick={() => {
                bluetooth.toggleEnabled();
                discoveryTimer?.cancel();
                bluetooth.toggleDiscovery({ value: false });
            }}
            isRootMounted={isRootMounted}
            transitionDuration={Transition.NORMAL}
            onSelect={async ({ value }) => {
                const device = unpackAccessor(devices).find((d) => d.address === value);

                device && await bluetooth.toggleConnected({ device });
                refresh();
            }}
            onToggle={(isOpened) => {
                if (isOpened) {
                    timeout(Transition.NORMAL, () => {
                        bluetooth.toggleEnabled({ value: true });
                        refresh();

                        discoveryTimer = timeout(Delay.L, function rescan() {
                            refresh();
                            timeout(Delay.L, rescan);
                        });
                    });
                } else {
                    discoveryTimer?.cancel();
                    bluetooth.toggleDiscovery({ value: false });
                }
            }}
            items={devices((v) => v.map((device) => ({
                name: device.alias,
                value: device.address,
                isActive: device.connected
            })))}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'bluetooth-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'bluetooth-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'bluetooth-dropdown-button__label')),
            }}
        />
    );
}
