import { createPoll } from 'ags/time';
import { Memory } from '../../models/Memory';
import { IconLabel } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { POLL_DELAY } from '../../constants/timer';
import { math } from '@apathoid/utils';

export interface IMemoryUsage {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function MemoryUsage(props: IMemoryUsage) {
    const { classes } = props;

    const memory = new Memory();

    const usage = createPoll(0, POLL_DELAY, async () => await memory.getUsedMemory());

    const memoryIcon = memory.getIcon();

    return (
        <IconLabel
            icon={memoryIcon}
            label={usage((v) => `${math.toFixedRounded(v / 1000000, 1)} Gb`)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'memory-usage')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'memory-usage__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'memory-usage__label')),
            }}
        />
    );
}
