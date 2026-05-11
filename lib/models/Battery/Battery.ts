import BatteryModule from 'gi://AstalBattery?version=0.1';
import { IconColorHint } from '../../types/icon';
import { createSubprocess, execAsync } from 'ags/process';

export class Battery {
    constructor(private BatteryService: BatteryModule.Device) {}

    getChargeRate() {
        return this.BatteryService.energyRate;
    }

    getIsConserved() {
        return createSubprocess('', ['sh', '-c', 'FOLLOW=1 $_APTH_BIN/system/battery/get_is_conserved']).as((v) => v == 'on');
    }

    toggleConservationMode() {
        return execAsync(['sh', '-c', '$_APTH_BIN/system/battery/toggle_conservation_mode']);
    }

    getIcon(args: { percentage: number; isCharging: boolean }) {
        const { percentage, isCharging } = args;

        if (percentage <= 5) {
            return { icon: isCharging ? '󰢟' : '󰂃', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.CRIT };
        }

        if (percentage <= 10) {
            return { icon: isCharging ? '󰢜' : '󰁺', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.CRIT };
        }

        if (percentage < 20) {
            return { icon: isCharging ? '󰂆' : '󰁻', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.CRIT };
        }

        if (percentage <= 30) {
            return { icon: isCharging ? '󰂇' : '󰁼', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.WARN };
        }

        if (percentage <= 40) {
            return { icon: isCharging ? '󰂈' : '󰁽', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        if (percentage <= 50) {
            return { icon: isCharging ? '󰢝' : '󰁾', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        if (percentage <= 60) {
            return { icon: isCharging ? '󰂉' : '󰁿', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        if (percentage <= 70) {
            return { icon: isCharging ? '󰢞' : '󰂀', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        if (percentage <= 80) {
            return { icon: isCharging ? '󰂊' : '󰂁', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        if (percentage <= 90) {
            return { icon: isCharging ? '󰂋' : '󰂂', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        if (percentage <= 100) {
            return { icon: isCharging ? '󰂋' : '󰂂', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
        }

        return { icon: isCharging ? '󰂄' : '󰁹', hint: isCharging ? IconColorHint.NORMAL : IconColorHint.NORMAL };
    }

    getChargeRateIcon() {
        return '󱐌';
    }
}
