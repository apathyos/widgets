import cn from 'classnames';
import { IconDropDownButton, IIconDropDownButton } from '../../shared';
import { Classes } from '../../types/utils';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import { Gpu } from '../../models/Gpu';
import { createComputed, createEffect, createState } from 'gnim';
import Gio from 'gi://Gio?version=2.0';
import { toGpuMode } from '../../utils/system';
import { Size } from '../../types/common';
import { GpuMode } from '../../types/system';

export interface IGpuSwitcherDropdownButton extends Pick<IIconDropDownButton, 'isRootMounted'> {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function GpuSwitcherDropdownButton(props: IGpuSwitcherDropdownButton) {
    const { isRootMounted, classes } = props;

    const gpu = new Gpu();

    const [gpuMode, setGpuMode] = createState(GpuMode.INTEGRATED);
    const [icon, setIcon] = createState(gpu.getIcon({ mode: unpackAccessor(gpuMode) }));

    createEffect(async () => {
        setGpuMode(await gpu.getCurrentMode());
        setIcon(gpu.getIcon({ mode: unpackAccessor(gpuMode) }));
    });

    Gio.DBus.session.signal_subscribe(
        null,
        'com.apathyos.system.gpu',
        'ModeChanged',
        '/com/apathyos/system/gpu',
        null,
        Gio.DBusSignalFlags.NONE,
        // (_conn, senderName, objectPath, iface, signalName, params) => {
        async () => {
            // params – это GVariant с аргументами сигнала
            // const [mode] = params.deepUnpack() as [GpuMode]; // mode: string
            // setGpuMode(mode);
            setGpuMode(await gpu.getCurrentMode());
            setIcon(gpu.getIcon({ mode: unpackAccessor(gpuMode) }));
        },
    );

    return (
        <IconDropDownButton
            icon={icon(v => v.icon)}
            label={gpuMode}
            isRootMounted={isRootMounted}
            onSelect={item => gpu.setMode({ mode: toGpuMode(item.value) })}
            items={createComputed(get => gpu.getModes().map(mode => ({
                name: mode,
                value: mode,
                icon: (
                    <label
                        label={gpu.getIcon({ mode }).icon}
                        widthRequest={Size.S}
                    />
                ),
                isActive: get(gpuMode) === mode
            })))}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'gpu-switcher-dropdown-button')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'gpu-switcher-dropdown-button__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'gpu-switcher-dropdown-button__label')),
            }}
        />
    );
}
