import { Gtk } from 'ags/gtk4';
import { Section } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { SPACING_L } from '../../constants/widget';
import {
    BluetoothDropdownButton,
    CpuProfileSwitcherDropdownButton,
    // GpuSwitcherDropdownButton,
    VpnDropdownButton,
    WifiDropdownButton
} from '../../features';

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
            <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING_L}>
                <box spacing={SPACING_L}>
                    <WifiDropdownButton isRootMounted={isRootMounted} />
                    <BluetoothDropdownButton isRootMounted={isRootMounted} />
                </box>
                <box spacing={SPACING_L}>
                    <VpnDropdownButton isRootMounted={isRootMounted} />
                    {/*<GpuSwitcherDropdownButton isRootMounted={isRootMounted} />*/}
                    <CpuProfileSwitcherDropdownButton isRootMounted={isRootMounted} />
                </box>
            </box>
        </Section>
    );
}
