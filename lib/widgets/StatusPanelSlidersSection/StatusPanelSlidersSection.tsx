import { VolumeSlider, MicSlider, BrightnessSlider, NightShiftSlider } from '../../features';
import { Section } from '../../shared';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import { Classes, PropertyValue } from '../../types/utils';
import { Gtk } from 'ags/gtk4';
import { SoundOutputSymbolPopupButton } from '../../features/SoundOutputSymbolPopupButton';
import { Spacing } from '../../types/common';

export interface IStatusPanelSlidersSection {
    isRootMounted: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function StatusPanelSlidersSection(props: IStatusPanelSlidersSection) {
    const { isRootMounted, classes } = props;

    return (
        <Section
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-sliders-section')),
            }}
        >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={Spacing.L}>
                <box spacing={Spacing.XL} homogeneous>
                    <box>
                        <VolumeSlider />
                        <SoundOutputSymbolPopupButton isRootMounted={isRootMounted} />
                    </box>
                    <MicSlider />
                </box>
                <box spacing={Spacing.XL} homogeneous>
                    <BrightnessSlider />
                    <NightShiftSlider />
                </box>
            </box>
        </Section>
    );
}
