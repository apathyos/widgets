import { execAsync } from 'ags/process';
import { Icon, IconColorHint } from '../../types/icon';
import { CpuProfile } from '../../types/system';
import { getSortedCpuProfilesList } from '../../utils/system';

export class Cpu {
    async getCurrentAvgFreq() {
        const freqs = (await execAsync(['sh', '-c', 'cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq'])).split('\n');
        const total = freqs.reduce((acc, curr) => (acc + +curr), 0);
        return total / freqs.length;
    }

    async getMaxFreq() {
        return +(await execAsync(['sh', '-c', 'cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq']));
    }

    async getCurrentTemp() {
        return +(await execAsync(['sh', '-c', '$_APATHY_OS/bin/system/get-cpu-temp']));
    }

    async getProfiles() {
        try {
            const profiles = JSON.parse(await execAsync(['sh', '-c', '$_APATHY_OS/bin/system/get-cpu-profiles'])) as CpuProfile[];
            return getSortedCpuProfilesList(profiles);
        } catch {
            return [];
        }
    }

    async getCurrentProfile() {
        return await execAsync(['sh', '-c', '$_APATHY_OS/bin/system/get-cpu-profile']) as CpuProfile;
    }

    async setProfile(args: { profile: CpuProfile }) {
        const { profile } = args;

        await execAsync(['sh', '-c', `$_APATHY_OS/bin/system/set-cpu-profile ${profile}`]);
    }

    getFreqIcon(args: { freq: number; maxFreq: number }) {
        const { freq, maxFreq } = args;
        const percentage = (freq * 100) / maxFreq;

        if (percentage >= 90) {
            return { icon: '', hint: IconColorHint.CRIT };
        }

        if (percentage >= 80) {
            return { icon: '', hint: IconColorHint.WARN };
        }

        return { icon: '', hint: IconColorHint.NORMAL };
    }

    getTempIcon(args: { temp: number }) {
        const { temp } = args;

        if (temp >= 80) {
            return { icon: '', hint: IconColorHint.CRIT };
        }

        if (temp >= 70) {
            return { icon: '', hint: IconColorHint.WARN };
        }

        if (temp >= 50) {
            return { icon: '', hint: IconColorHint.NORMAL };
        }

        return { icon: '', hint: IconColorHint.NORMAL };
    }

    getProfileIcon(args: { profile: CpuProfile }) {
        const { profile } = args;
        const icon: Icon = { icon: '' };

        switch (profile) {
            case CpuProfile.QUIET:
                icon.icon = '󰾆';
                break;
            case CpuProfile.BALANCED:
                icon.icon = '󰾅';
                break;
            case CpuProfile.PERFORMANCE:
                icon.icon = '󰓅';
                break;
        }

        return icon;
    }
}
