import cn from 'classnames';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import { Classes } from '../../types/utils';
import { stableAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { createComputed, createEffect, createState } from 'gnim';
import { Size } from '../../types/common';
import { CpuProfile } from '../../types/system';
import { Cpu } from '../../models/Cpu';
import { getCpuProfileDisplayValue } from '../../utils/system';
import { isNonNullableAccessor } from '@/utils/typeguards';

export interface ICpuProfileSwitcherDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted' | 'hexpand'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function CpuProfileSwitcherDropdownButton(props: ICpuProfileSwitcherDropdownButton) {
    const { isRootMounted, hexpand, classes } = props;

    const cpu = new Cpu();

    const [cpuProfiles, setCpuProfiles] = createState<CpuProfile[]>([]);
    const [activeProfile, setActiveProfile] = createState(CpuProfile.BALANCED);
    const [icon, setIcon] = createState(cpu.getProfileIcon({ profile: unpackAccessor(activeProfile) }));
    const [loading, setLoading] = createState<string | null>(null);

    const values = stableAccessor(cpuProfiles);

    const refreshState = async () => {
        const profile = await cpu.getCurrentProfile();

        setCpuProfiles(await cpu.getProfiles());
        setActiveProfile(profile);
        setIcon(cpu.getProfileIcon({ profile }));
    };

    createEffect(refreshState);

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={activeProfile(v => getCpuProfileDisplayValue(v))}
            values={values}
            isRootMounted={isRootMounted}
            hexpand={hexpand}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'cpu-profile-switcher-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'cpu-profile-switcher-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'cpu-profile-switcher-dropdown-button__label')),
            }}
            getItem={value => {
                const profile = cpuProfiles(v => v.find(p => p === value));

                if (!isNonNullableAccessor(profile)) {
                    return null;
                }

                const itemValue = unpackAccessor(profile);

                return {
                    name: profile(getCpuProfileDisplayValue),
                    value: itemValue,
                    icon: (
                        <label
                            label={profile(profile => cpu.getProfileIcon({ profile }).icon)}
                            widthRequest={Size.S}
                        />
                    ),
                    isActive: createComputed(get => get(profile) === get(activeProfile)),
                    isLoading: loading(v => v === itemValue),
                    isDisabled: loading(v => !!(v && v !== itemValue))
                };
            }}
            onSelect={async item => {
                if (item.value === unpackAccessor(activeProfile)) {
                    return;
                }

                setLoading(item.value);
                await cpu.setProfile({ profile: item.value as CpuProfile });
                await refreshState();
                setLoading(null);
            }}
        />
    );
}
