import { IconLabel } from '../../shared';
import { createPoll } from 'ags/time';
import { Classes } from '../../types/utils';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { Cpu } from '../../models/Cpu';
import { createComputed, createState } from 'gnim';
import { IconColorHint } from '../../types/icon';
import { POLL_DELAY } from '../../constants/timer';
import { math } from '@apathoid/utils';

export interface ICpuClock {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function CpuClock(props: ICpuClock) {
    const { classes } = props;

    const cpu = new Cpu();

    const [maxFreq, setMaxFreq] = createState(0);
    const [freq, setFreq] = createState(0);

    const cpuFreqs = createPoll(null, POLL_DELAY, async () => {
        return { maxFreq: await cpu.getMaxFreq(), freq: await cpu.getCurrentAvgFreq() };
    });

    cpuFreqs.subscribe(() => {
        const freqs = unpackAccessor(cpuFreqs);

        if (freqs) {
            setMaxFreq(freqs.maxFreq);
            setFreq(freqs.freq);
        }
    });

    const freqIcon = createComputed((get) => cpu.getFreqIcon({ freq: get(freq), maxFreq: get(maxFreq) }));

    return (
        <IconLabel
            icon={freqIcon((v) => v.icon)}
            label={freq((v) => `${math.toFixedRounded(v / 1000000, 1)} GHz`)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'cpu-clock')),
                icon: updateAccessor(classes?.icon, (icon, get) => {
                    const hint = get(freqIcon).hint;

                    return cn(
                        icon,
                        'cpu-clock__icon',
                        hint === IconColorHint.CRIT
                            ? 'cpu-clock__icon_crit'
                            : hint === IconColorHint.WARN
                              ? 'cpu-clock__icon_warn'
                              : '',
                    );
                }),
                label: updateAccessor(classes?.label, (label) => cn(label, 'cpu-clock__label')),
            }}
        />
    );
}
