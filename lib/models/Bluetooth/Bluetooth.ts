import BluetoothModule from 'gi://AstalBluetooth?version=0.1';
import { SystemComponent } from '../base/SystemComponent';
import { Icon } from '../../types/icon';

export class Bluetooth extends SystemComponent {
    constructor(private BluetoothService: BluetoothModule.Bluetooth) {
        super();
    }

    getIsEnabled() {
        return this.BluetoothService.isPowered;
    }

    toggleEnabled(args?: { value?: boolean; }) {
        const { value } = args ?? {};

        const currentValue = this.BluetoothService.isPowered;
        const newValue = value ?? !currentValue;

        this.BluetoothService.adapter?.set_powered(newValue);
    }

    getIsConnected() {
        return this.BluetoothService.isConnected;
    }

    async toggleConnected(args?: { device?: BluetoothModule.Device, value?: boolean; }) {
        const { device, value } = args ?? {};

        if (device) {
            await this.toggleConnection({ device, value });
        } else {
            await this.toggleConnectedState({ value });
        }
    }

    getIsDeviceConnected(args: { device: BluetoothModule.Device; }) {
        const { device } = args;

        return device.connected;
    }

    getIsDiscovering() {
        if (!this.getIsEnabled()) {
            console.error('Can\'t enable discovering: bluetooth is off!');
            return;
        }

        return this.BluetoothService.adapter?.discovering;
    }

    getDevices(args?: { onlyActive?: boolean; }) {
        const { onlyActive } = args ?? {};

        let devices = this.BluetoothService.devices;
        onlyActive && (devices = devices.filter(d => d.connected));

        return devices.sort((a, b) => a.paired < b.paired ? 1 : -1);
    }

    toggleDiscovery(args?: { value?: boolean }) {
        const isDiscovering = this.getIsDiscovering();
        const value = args?.value ?? !isDiscovering;

        if (value === isDiscovering) {
            return;
        }

        if (value) {
            this.BluetoothService.adapter?.start_discovery();
        } else {
            this.BluetoothService.adapter?.stop_discovery();
        }
    }

    getIcon(): Icon {
        const isEnabled = this.getIsEnabled();
        const isConnected = this.getIsConnected();
        const icon: Icon = { icon: '󰂲' };

        if (isEnabled) {
            icon.icon = '󰂯';
        }

        if (isConnected) {
            icon.icon = '󰂱';
        }

        return icon;
    }

    protected async toggleConnection(args: { device: BluetoothModule.Device, value?: boolean; }) {
        const { device, value } = args;
        const isDeviceConnected = this.getIsDeviceConnected({ device });

        if (value && isDeviceConnected) {
            return;
        }

        return new Promise<void>(res => {
            if (isDeviceConnected) {
                device.disconnect_device((_, result) => {
                    device.disconnect_device_finish(result);
                    res();
                });
            }

            device.connect_device((_, result) => {
                device.connect_device_finish(result);
                res();
            });
        });
    }

    protected async toggleConnectedState(args?: { value?: boolean; }) {
        const { value = !this.getIsConnected() } = args ?? {};
        const devices = this.getDevices();

        for (const device of devices) {
            await this.toggleConnection({ device, value });
        }
    }
}
