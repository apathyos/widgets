import cn from 'classnames';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import { Classes } from '../../types/utils';
import { stableAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { Gpu } from '../../models/Gpu';
import { createComputed, createEffect, createState } from 'gnim';
import Gio from 'gi://Gio?version=2.0';
import { toGpuMode } from '../../utils/system';
import { Size } from '../../types/common';
import { GpuMode } from '../../types/system';
import { isNonNullableAccessor } from '@/utils/typeguards';

export interface IGpuSwitcherDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function GpuSwitcherDropdownButton(props: IGpuSwitcherDropdownButton) {
    const { isRootMounted, classes } = props;

    const gpu = new Gpu();

    const [modes, setModes] = createState(gpu.getModes());
    const [gpuMode, setGpuMode] = createState(GpuMode.INTEGRATED);
    const [icon, setIcon] = createState(gpu.getIcon({ mode: unpackAccessor(gpuMode) }));

    const values = stableAccessor(modes);

    const refresh = async () => {
        setModes(gpu.getModes());
        setGpuMode(await gpu.getCurrentMode());
        setIcon(gpu.getIcon({ mode: unpackAccessor(gpuMode) }));
    };

    createEffect(refresh);

    Gio.DBus.session.signal_subscribe(
        null,
        'com.apathyos.system.gpu',
        'ModeChanged',
        '/com/apathyos/system/gpu',
        null,
        Gio.DBusSignalFlags.NONE,
        refresh
    );

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={gpuMode}
            values={values}
            isRootMounted={isRootMounted}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'gpu-switcher-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'gpu-switcher-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'gpu-switcher-dropdown-button__label')),
            }}
            getItem={value => {
                const mode = modes(v => v.find(m => m === value));

                if (!isNonNullableAccessor(mode)) {
                    return null;
                }

                return {
                    name: mode,
                    value: unpackAccessor(mode),
                    icon: (
                        <label
                            label={mode(mode => gpu.getIcon({ mode }).icon)}
                            widthRequest={Size.S}
                        />
                    ),
                    isActive: createComputed(get => get(gpuMode) === get(mode))
                };
            }}
            onSelect={item => gpu.setMode({ mode: toGpuMode(item.value) })}
        />
    );
}
