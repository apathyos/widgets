import { Gtk } from 'ags/gtk4';
import { Section } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import {
    BluetoothDropdownButton,
    CpuProfileSwitcherDropdownButton,
    // GpuSwitcherDropdownButton,
    VpnDropdownButton,
    WifiDropdownButton
} from '../../features';
import { Spacing } from '@/types/common';

export interface IStatusPanelButtonsSection {
    isRootMounted: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function StatusPanelButtonsSection(props: IStatusPanelButtonsSection) {
    const { isRootMounted, classes } = props;

    return (
        <Section
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-buttons-section')),
            }}
        >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={Spacing.L}>
                <box spacing={Spacing.L}>
                    <WifiDropdownButton isRootMounted={isRootMounted} />
                    <BluetoothDropdownButton isRootMounted={isRootMounted} />
                </box>
                <box spacing={Spacing.L}>
                    <VpnDropdownButton isRootMounted={isRootMounted} />
                    {/*<GpuSwitcherDropdownButton isRootMounted={isRootMounted} />*/}
                    <CpuProfileSwitcherDropdownButton isRootMounted={isRootMounted} />
                </box>
            </box>
        </Section>
    );
}
