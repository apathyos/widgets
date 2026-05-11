import WP from 'gi://AstalWp?version=0.1';
import { Level } from '../../types/common';

export class Volume {
    constructor(private WirePlumberService: WP.Wp) {}

    getOutputIcon(args: { volume: number; isMuted: boolean }) {
        const { volume, isMuted } = args;

        if (!volume || isMuted) {
            return { icon: '󰸈', level: Level.ZERO };
        }

        if (volume <= 0.3) {
            return { icon: '', level: Level.LOW };
        }

        if (volume >= 0.6) {
            return { icon: '', level: Level.HIGH };
        }

        return { icon: '', level: Level.MEDIUM };
    }

    getMicIcon(args: { volume: number; isMuted: boolean }) {
        const { volume, isMuted } = args;

        if (!volume || isMuted) {
            return '';
        }

        return '';
    }
}
