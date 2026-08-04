import { Gtk } from 'ags/gtk4';
import { DpmsPopupButton, SystemLockButton, SystemLogoutButton, SystemPowerButton, SystemSuspendButton } from '../../features';
import { Section } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { Spacing } from '@/types/common';

export interface IStatusPanelControlsSection {
    isRootMounted: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function StatusPanelControlsSection(props: IStatusPanelControlsSection) {
    const { isRootMounted, classes } = props;

    return (
        <Section
            hexpand
            spacing={Spacing.L}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-controls-section')),
            }}
        >
            <DpmsPopupButton
                isRootMounted={isRootMounted}
                halign={Gtk.Align.FILL}
                hexpand
                classes={{ root: 'status-panel-controls-section__button' }}
            />
            <SystemLockButton halign={Gtk.Align.FILL} hexpand classes={{ root: 'status-panel-controls-section__button' }} />
            <SystemSuspendButton halign={Gtk.Align.FILL} hexpand classes={{ root: 'status-panel-controls-section__button' }} />
            <SystemLogoutButton halign={Gtk.Align.FILL} hexpand classes={{ root: 'status-panel-controls-section__button' }} />
            <SystemPowerButton
                isRootMounted={isRootMounted}
                halign={Gtk.Align.FILL}
                hexpand
                classes={{ root: 'status-panel-controls-section__button' }}
            />
        </Section>
    );
}
