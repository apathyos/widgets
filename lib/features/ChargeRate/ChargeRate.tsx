import BatteryModule from 'gi://AstalBattery?version=0.1';
import { Battery } from '../../models/Battery';
import { IconLabel } from '../../shared';
import { createState } from 'gnim';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { math } from '@apathoid/utils';

const BatteryService = BatteryModule.get_default();

export interface IChargeRate {
    classes?: Classes<'root' | 'icon' | 'label'>;
}

export function ChargeRate(props: IChargeRate) {
    const { classes } = props;

    const battery = new Battery(BatteryService);

    const [rate, setRate] = createState(battery.getChargeRate());

    BatteryService.connect('notify', () => setRate(battery.getChargeRate()));
    const rateIcon = battery.getChargeRateIcon();

    return (
        <IconLabel
            icon={rateIcon}
            label={rate((v) => `${math.toFixedRounded(v, 0)} W`)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'charge-rate')),
                icon: updateAccessor(classes?.icon, (icon) => cn(icon, 'charge-rate__icon')),
                label: updateAccessor(classes?.label, (label) => cn(label, 'charge-rate__label')),
            }}
        />
    );
}
