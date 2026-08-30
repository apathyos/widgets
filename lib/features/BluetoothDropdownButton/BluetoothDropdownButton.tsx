import { createComputed, createState, onCleanup } from 'gnim';
import { Bluetooth } from '../../models/Bluetooth';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import { Classes } from '../../types/utils';
import { getStringList, stableAccessor, toMap, unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import BluetoothModule from 'gi://AstalBluetooth?version=0.1';
import { timeout, Timer } from 'ags/time';
import { Delay, Transition } from '../../types/common';
import { isNonNullableAccessor } from '@/utils/typeguards';

const BluetoothService = BluetoothModule.get_default();

export interface IBluetoothDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted' | 'hexpand'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function BluetoothDropdownButton(props: IBluetoothDropdownButton) {
    const { isRootMounted, hexpand, classes } = props;

    const bluetooth = new Bluetooth(BluetoothService);

    const [isEnabled, setIsEnabled] = createState(bluetooth.getIsEnabled());
    const [isConnected, setIsConnected] = createState(bluetooth.getIsConnected());
    const [devices, setDevices] = createState(toMap(bluetooth.getDevices(), d => d.address));
    const [icon, setIcon] = createState(bluetooth.getIcon());

    const values = stableAccessor(devices, { compose: (devices) => [...devices.keys()] });

    let discoveryTimer: Timer | null = null;

    const refresh = () => {
        setIsEnabled(bluetooth.getIsEnabled());
        setIsConnected(bluetooth.getIsConnected());
        setDevices(toMap(bluetooth.getDevices(), d => d.address));
        setIcon(bluetooth.getIcon());
    };

    BluetoothService.connect('notify', refresh);

    const label = createComputed((get) => {
        return get(isEnabled)
            ? get(isConnected)
                ? getStringList([...get(devices).values()].filter(d => d.connected), item => item.alias)
                : 'not connected'
            : 'off';
    });

    onCleanup(() => {
        discoveryTimer?.cancel();
    });

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={label}
            values={values}
            isRootMounted={isRootMounted}
            hexpand={hexpand}
            transitionDuration={Transition.NORMAL}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'bluetooth-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'bluetooth-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'bluetooth-dropdown-button__label')),
            }}
            getItem={value => {
                const device = devices(v => v.get(value));

                if (!isNonNullableAccessor(device)) {
                    return null;
                }

                return {
                    name: device(v => v.alias),
                    value: unpackAccessor(device).address,
                    isActive: device(v => v.connected)
                };
            }}
            onClick={() => {
                bluetooth.toggleEnabled();
                discoveryTimer?.cancel();
                bluetooth.toggleDiscovery({ value: false });
            }}
            onSelect={async ({ value }) => {
                const device = unpackAccessor(devices).get(value);

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
                            discoveryTimer = timeout(Delay.L, rescan);
                        });
                    });
                } else {
                    discoveryTimer?.cancel();
                    bluetooth.toggleDiscovery({ value: false });
                }
            }}
        />
    );
}
