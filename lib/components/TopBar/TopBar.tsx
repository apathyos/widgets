import { Gdk } from 'ags/gtk4';
import {
    ActiveWindowTitle,
    CpuClock,
    CpuTemp,
    DontDisturbButton,
    KeyboardButton,
    SoundOutputButton,
    WifiButton,
    Worskpaces,
    BatteryButton,
    BluetoothButton,
    VolumeButton,
    MemoryUsage,
    ChargeRate,
    NightShiftButton,
    ScreenRecordButton,
} from '../../features';
import { Section, SectionBar } from '../../shared';
import { Date } from '../../features/Date/Date';
import { StatusPanelButton } from '../../features/StatusPanelButton';
import { Spacing } from '@/types/common';

export interface ITopBar {
    monitor: Gdk.Monitor;
}

export function TopBar(props: ITopBar) {
    const { monitor } = props;

    return (
        <SectionBar
            left={[
                <box spacing={Spacing.L}>
                    <Worskpaces monitor={monitor} />
                    <ActiveWindowTitle monitor={monitor} />
                </box>
            ]}
            center={[
                <Section>
                    <Date />
                </Section>
            ]}
            right={[
                <box spacing={Spacing.M}>
                    <Section>
                        <KeyboardButton />
                    </Section>
                    <Section>
                        <WifiButton />
                        <BluetoothButton />
                    </Section>
                    <Section spacing={Spacing.S}>
                        <ScreenRecordButton />
                        <SoundOutputButton />
                        <DontDisturbButton />
                        <VolumeButton />
                        <NightShiftButton />
                        <BatteryButton />
                    </Section>
                    <Section spacing={Spacing.L}>
                        <CpuClock />
                        <CpuTemp />
                        <MemoryUsage />
                        <ChargeRate />
                    </Section>
                </box>,
                <StatusPanelButton />,
            ]}
            classes={{
                content: 'top-bar__content',
            }}
        />
    );
}
