import WP from 'gi://AstalWp?version=0.1';
import { SystemComponent } from '../base/SystemComponent';
import { Icon } from '../../types/icon';

export class SoundOutput extends SystemComponent {
    constructor(private WirePlumberService: WP.Wp) {
        super();
    }

    getDefaultSpeaker() {
        return this.WirePlumberService.get_default_speaker();
    }

    getDefaultMic() {
        return this.WirePlumberService.get_default_microphone();
    }

    getOutputs() {
        return this.WirePlumberService.audio.speakers;
    }

    getOutputById(args: {
        id: number;
    }) {
        const { id } = args;

        return this.WirePlumberService.audio.speakers?.find(s => s.id === id);
    }

    getIcon() {
        const iconType = this.getDefaultSpeaker().icon;

        const icon: Icon = { icon: '' };

        if (iconType.includes('speakers-bluetooth')) {
            icon.icon = '󰦢';
        } else if (iconType.includes('headphones-bluetooth') || iconType.includes('headset-bluetooth')) {
            icon.icon = '󰥰';
        } else {
            icon.icon = '󰓃';
        }

        return icon;
    }
}
