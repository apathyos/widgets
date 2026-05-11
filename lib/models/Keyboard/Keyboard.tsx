import { execAsync } from 'ags/process';
import { Icon } from '../../types/icon';
import { SystemComponent } from '../base/SystemComponent';
import { IPC } from '../../constants/os';

export class Keyboard extends SystemComponent {
    getCurrentLayout() {
        return execAsync(['sh', '-c', `${IPC} input keyboard | jq '.layout_short'`]);
    }

    getIcon(): Icon {
        return { icon: '' };
    }
}
