import Gio from 'gi://Gio?version=2.0';
import { Bus } from '../base/Bus';
import { NMSettingsConnectionBusMethod, NMSettingsConnectionSignatureByMethod } from '../types/network';
import { NM_BUS_NAME, NM_SETTINGS_CONNECTION_INTERFACE, NM_SETTINGS_CONNECTION_PATH } from '@/constants/auth';

export class NetworkSettingsConnection {
    private readonly bus: Bus<NMSettingsConnectionSignatureByMethod>;

    constructor() {
        this.bus = new Bus(Gio.DBus.system, NM_BUS_NAME, NM_SETTINGS_CONNECTION_PATH, NM_SETTINGS_CONNECTION_INTERFACE);
    }

    clearConnectionSecrets(args: {
        path: string;
    }) {
        const { path } = args;

        return this.bus.call({ method: NMSettingsConnectionBusMethod.ClearSecrets, path });
    }
}
