import { Section } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { DontDisturbButton, SoundOutputButton } from '../../features';
import { Spacing } from '@/types/common';

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
            <box spacing={Spacing.L}>
                <DontDisturbButton classes={{ root: 'status-panel-togglers-section__button' }} />
                <SoundOutputButton classes={{ root: 'status-panel-togglers-section__button' }} />
            </box>
        </Section>
    );
}
