import { execAsync } from 'ags/process';
import { Icon } from '../../types/icon';
import { SystemComponent } from '../base/SystemComponent';
import { SystemInhibitorType, SystemInhibitor } from '@/types/system';

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

    getSystemInhibitors(): (SystemInhibitor & { icon: string })[] {
        return [
            { type: SystemInhibitorType.IDLE, name: 'idle', description: 'Inhibit system idle', icon: '' },
            { type: SystemInhibitorType.SLEEP, name: 'sleep', description: 'Inhibit system sleep', icon: '󰒲' },
            { type: SystemInhibitorType.LID, name: 'lid', description: 'Inhibit system laptop lid switch', icon: '' },
        ];
    }

    toggleSystemInhibitor(args: { type: SystemInhibitorType; description: string }) {
        const { type, description } = args;

        return execAsync(['sh', '-c', `$_APATHY_OS/bin/system/toggle_inhibitor "${type}" "${description}"`]);
    }

    async getActiveInhibitors(): Promise<SystemInhibitor[]> {
        try {
            const result = await execAsync(['sh', '-c', '$_APATHY_OS/bin/system/get_active_inhibitors']);

            return JSON.parse(result);
        } catch (e) {
            console.error(`Couldn't get active inhibitors: ${e}`);
            return [];
        }
    }

    getIcon() {
        const icon: Icon = { icon: '' };

        return icon;
    }
}
