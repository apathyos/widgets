import { Surface } from '../../shared';
import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';
import {
    StatusPanelButtonsSection,
    StatusPanelControlsSection,
    StatusPanelPlayerSection,
    StatusPanelSlidersSection,
    StatusPanelTraySection,
} from '../../widgets';
import { STATUS_PANEL_WIDTH } from '../../constants/widget';
import { Spacing } from '../../types/common';

export interface IStatusPanel {
    isOpened: PropertyValue<boolean>;
    classes?: Classes<'root' | 'revealer'>;
}

export function StatusPanel(props: IStatusPanel) {
    const { isOpened, classes } = props;

    return (
        <Surface
            css={`min-width: ${STATUS_PANEL_WIDTH}px;`}
            classes={{ root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel')) }}
        >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={Spacing.L}>
                <StatusPanelSlidersSection isRootMounted={isOpened} />
                <StatusPanelButtonsSection isRootMounted={isOpened} />
                <StatusPanelPlayerSection />
                <box vexpand>
                    <StatusPanelTraySection />
                </box>
                <box valign={Gtk.Align.END}>
                    <StatusPanelControlsSection isRootMounted={isOpened} />
                </box>
            </box>
        </Surface>
    );
}
