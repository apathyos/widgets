import { execAsync } from 'ags/process';
import { Icon } from '../../types/icon';
import { SystemComponent } from '../base/SystemComponent';

export class System extends SystemComponent {
    logout() {
        return execAsync(['sh', '-c', '$_APATHY_OS/bin/system/logout']);
    }

    lock() {
        return execAsync(['sh', '-c', '$_APATHY_OS/bin/system/lock']);
    }

    suspend() {
        return execAsync(['sh', '-c', '$_APATHY_OS/bin/system/suspend']);
    }

    reboot() {
        return execAsync(['sh', '-c', '$_APATHY_OS/bin/system/reboot']);
    }

    shutdown() {
        return execAsync(['sh', '-c', '$_APATHY_OS/bin/system/shutdown']);
    }

    getIcon() {
        const icon: Icon = { icon: '' };

        return icon;
    }
}
