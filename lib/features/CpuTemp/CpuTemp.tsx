import { IconLabel } from '../../shared';
import { createPoll } from 'ags/time';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { createComputed } from 'gnim';
import { Cpu } from '../../models/Cpu';
import { IconColorHint } from '../../types/icon';
import { POLL_DELAY } from '../../constants/timer';
import { math } from '@apathoid/utils';

export interface ICpuTemp {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function CpuTemp(props: ICpuTemp) {
    const { classes } = props;

    const cpu = new Cpu();

    const temp = createPoll(0, POLL_DELAY, () => cpu.getCurrentTemp());
    const tempIcon = createComputed((get) => cpu.getTempIcon({ temp: get(temp) }));

    return (
        <IconLabel
            icon={tempIcon((v) => v.icon)}
            label={temp((v) => `${math.toFixedRounded(v, 1)}°`)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'cpu-temp')),
                icon: updateAccessor(classes?.icon, (icon, get) => {
                    const hint = get(tempIcon).hint;

                    return cn(
                        icon,
                        'cpu-temp__icon',
                        hint === IconColorHint.CRIT
                            ? 'cpu-temp__icon_crit'
                            : hint === IconColorHint.WARN
                              ? 'cpu-temp__icon_warn'
                              : '',
                    );
                }),
                label: updateAccessor(classes?.label, (label) => cn(label, 'cpu-temp__label')),
            }}
        />
    );
}
