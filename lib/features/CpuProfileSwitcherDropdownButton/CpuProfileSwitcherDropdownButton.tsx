import cn from 'classnames';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import { Classes } from '../../types/utils';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import { createComputed, createEffect, createState } from 'gnim';
import { Size } from '../../types/common';
import { CpuProfile } from '../../types/system';
import { Cpu } from '../../models/Cpu';
import { getCpuProfileDisplayValue } from '../../utils/system';

export interface ICpuProfileSwitcherDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function CpuProfileSwitcherDropdownButton(props: ICpuProfileSwitcherDropdownButton) {
    const { isRootMounted, classes } = props;

    const cpu = new Cpu();

    const [cpuProfiles, setCpuProfiles] = createState<CpuProfile[]>([]);
    const [activeProfile, setActiveProfile] = createState(CpuProfile.BALANCED);
    const [icon, setIcon] = createState(cpu.getProfileIcon({ profile: unpackAccessor(activeProfile) }));

    const refreshState = async () => {
        setCpuProfiles(await cpu.getProfiles());
        setActiveProfile(await cpu.getCurrentProfile());
        setIcon(cpu.getProfileIcon({ profile: unpackAccessor(activeProfile) }));
    };

    createEffect(refreshState);

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={activeProfile(v => getCpuProfileDisplayValue(v))}
            isRootMounted={isRootMounted}
            onSelect={async item => {
                await cpu.setProfile({ profile: item.value as CpuProfile });
                refreshState();
            }}
            items={createComputed(get => get(cpuProfiles).map(profile => ({
                name: getCpuProfileDisplayValue(profile),
                value: profile,
                icon: (
                    <label
                        label={cpu.getProfileIcon({ profile }).icon}
                        widthRequest={Size.S}
                    />
                ),
                isActive: get(activeProfile) === profile
            })))}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'cpu-profile-switcher-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'cpu-profile-switcher-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'cpu-profile-switcher-dropdown-button__label')),
            }}
        />
    );
}
