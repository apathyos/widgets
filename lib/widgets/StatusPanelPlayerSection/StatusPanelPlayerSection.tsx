import { MusicPlayer } from '../../features';
import { Section } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface IStatusPanelPlayerSection {
    classes?: Classes<'root'>;
}

export function StatusPanelPlayerSection(props: IStatusPanelPlayerSection) {
    const { classes } = props;

    return (
        <Section
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-player-section')),
            }}
        >
            <MusicPlayer />
        </Section>
    );
}
