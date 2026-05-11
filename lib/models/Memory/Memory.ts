import { execAsync } from 'ags/process';
import { MemoryValue } from '../../types/system';

export class Memory {
    constructor() {}

    async getMemoryValue(args: { type: MemoryValue }) {
        const { type } = args;

        return (await this.getMemoryStats())[type];
    }

    async getUsedMemory() {
        const stats = await this.getMemoryStats();
        return stats[MemoryValue.TOTAL] - stats[MemoryValue.AVAILABLE];
    }

    async getMemoryStats() {
        return (await execAsync(['sh', '-c', 'cat /proc/meminfo']))
            .split('\n')
            .reduce(
                (acc, str) => {
                    const [name, value] = str.split(' ').filter((s) => s);
                    const memValue = Number.parseInt(value, 10);
                    acc[name.slice(0, -1) as MemoryValue] = memValue;

                    return acc;
                },
                {} as Record<MemoryValue, number>,
            );
    }

    getIcon() {
        return '';
    }
}
