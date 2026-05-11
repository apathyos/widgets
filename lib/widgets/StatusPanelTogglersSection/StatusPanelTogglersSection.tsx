import { Section } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { SPACING_L } from '../../constants/widget';
import { DontDisturbButton, SoundOutputButton } from '../../features';

export interface IStatusPanelTogglersSection {
    classes?: Classes<'root'>;
}

export function StatusPanelTogglersSection(props: IStatusPanelTogglersSection) {
    const { classes } = props;

    return (
        <Section
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-togglers-section')),
            }}
        >
            <box spacing={SPACING_L}>
                <DontDisturbButton classes={{ root: 'status-panel-togglers-section__button' }} />
                <SoundOutputButton classes={{ root: 'status-panel-togglers-section__button' }} />
            </box>
        </Section>
    );
}
