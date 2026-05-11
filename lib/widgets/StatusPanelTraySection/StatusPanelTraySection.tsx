import { createState } from 'gnim';
import { Section } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { TrayType } from '../../types/tray';
import { StatusPanelTraySectionBody } from './StatusPanelTraySectionBody';
import { StatusPanelTraySectionHeader } from './StatusPanelTraySectionHeader';
import { Gtk } from 'ags/gtk4';
import { SPACING_S } from '../../constants/widget';

export interface IStatusPanelTraySection {
    classes?: Classes<'root' | 'body'>;
}

export function StatusPanelTraySection(props: IStatusPanelTraySection) {
    const { classes } = props;

    const [activeTray, setActiveTray] = createState(TrayType.NOTIFICATIONS);

    return (
        <Section
            orientation={Gtk.Orientation.VERTICAL}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-tray-section')),
            }}
        >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING_S}>
                <StatusPanelTraySectionHeader activeTray={activeTray} setActiveTray={setActiveTray} />
                <Section
                    classes={{
                        root: updateAccessor(classes?.body, (body) => cn(body, 'status-panel-tray-section__body')),
                    }}
                >
                    <StatusPanelTraySectionBody activeTray={activeTray} />
                </Section>
            </box>
        </Section>
    );
}
