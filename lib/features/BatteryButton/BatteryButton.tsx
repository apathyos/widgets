import { createComputed, createState, With } from 'gnim';
import BatteryModule from 'gi://AstalBattery?version=0.1';
import { SymbolButton, Icon } from '../../shared';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { Gtk } from 'ags/gtk4';
import { Battery } from '../../models/Battery';
import { IconColorHint } from '../../types/icon';

const BatteryService = BatteryModule.get_default();

export interface IBatteryButton {
    withConservation?: PropertyValue<boolean>;
    withPercent?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'button' | 'battery' | 'percentage' | 'conservation'>;
}

export function BatteryButton(props: IBatteryButton) {
    const { withConservation = true, withPercent = true, classes } = props;

    const battery = new Battery(BatteryService);

    const isConserved = battery.getIsConserved();
    const [isCharging, setIsCharging] = createState(BatteryService.charging);
    const [percentage, setPercentage] = createState(Math.floor(BatteryService.percentage * 100));

    BatteryService.connect('notify', () => {
        setIsCharging(BatteryService.charging);
    });

    BatteryService.connect('notify::percentage', (device) => {
        setPercentage(device.percentage * 100);
    });

    const batteryIcon = createComputed(
        (get) => battery.getIcon({ percentage: get(percentage), isCharging: get(isCharging) })
    );

    return (
        <SymbolButton
            onClick={() => battery.toggleConservationMode()}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'battery-button')),
            }}
            hexpand={false}
        >
            <box
                class="battery-button__content-container"
                hexpand
                halign={Gtk.Align.CENTER}
                vexpand={false}
                valign={Gtk.Align.CENTER}
            >
                <With value={toAccessor(withConservation)}>
                    {(withConservation: boolean) => withConservation && (
                        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START}>
                            <Icon
                                classes={{
                                    root: updateAccessor(
                                        classes?.conservation,
                                        (conservation) => cn(conservation, 'battery-button__conservation')
                                    )
                                }}
                                label={isConserved((v) => (v ? '󰣐' : ''))}
                            />
                        </box>
                    )}
                </With>

                <label
                    class={updateAccessor(classes?.battery, (battery, get) => {
                        const hint = get(batteryIcon).hint;
                        return cn(
                            battery,
                            'battery-button__battery',
                            hint === IconColorHint.CRIT
                                ? 'battery-button__battery_crit'
                                : hint === IconColorHint.WARN
                                  ? 'battery-button__battery_warn'
                                  : '',
                        );
                    })}
                    label={batteryIcon((v) => v.icon)}
                />

                <With value={toAccessor(withPercent)}>
                    {(withPercent: boolean) => withPercent && (
                        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.END}>
                            <Icon
                                classes={{
                                    root: updateAccessor(
                                        classes?.percentage,
                                        (percentage) => cn(percentage, 'battery-button__percentage')
                                    )
                                }}
                                label={percentage((v) => v.toFixed(0))}
                            />
                        </box>
                    )}
                </With>
            </box>
        </SymbolButton>
    );
}
