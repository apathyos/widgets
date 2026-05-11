import { execAsync } from 'ags/process';
import { Icon } from '../../types/icon';
import { SystemComponent } from '../base/SystemComponent';
import { toGpuMode } from '../../utils/system';
import { GpuMode } from '../../types/system';

export class Gpu extends SystemComponent {
    getModes() {
        return Object.values(GpuMode);
    }

    async getCurrentMode() {
        const mode = await execAsync(['sh', '-c', '$_APATHY_OS/bin/system/get-gpu-mode']);

        return toGpuMode(mode);
    }

    async setMode(args: {
        mode: GpuMode;
    }) {
        const { mode } = args;

        await execAsync(['sh', '-c', `$_APATHY_OS/bin/system/switch-gpu-mode ${mode}`]);
    }

    getIcon(args: {
        mode: GpuMode;
    }) {
        const { mode } = args;

        const gpuMode = mode;
        const icon: Icon = { icon: '' };

        switch (gpuMode) {
            case GpuMode.HYBRID:
                icon.icon = '';
                break;
            case GpuMode.NVIDIA:
                icon.icon = '';
                break;
            default:
                icon.icon = '󰌢';
        }

        return icon;
    }
}
