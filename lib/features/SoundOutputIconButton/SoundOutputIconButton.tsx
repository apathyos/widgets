import cn from 'classnames';
import { SymbolButton } from '../../shared';
import WP from 'gi://AstalWp?version=0.1';
import { SoundOutput } from '../../models/SoundOutput';
import { createState } from 'gnim';

const WirePlumberService = WP.get_default();

export interface ISoundOutputIconButton {
    classes?: {
        root?: string;
        label?: string;
    };
}

export function SoundOutputIconButton(props: ISoundOutputIconButton) {
    const { classes } = props;

    const soundOutput = new SoundOutput(WirePlumberService);

    const [icon, setIcon] = createState(soundOutput.getIcon());

    soundOutput.getDefaultMic().connect('notify', () => {
        setIcon(soundOutput.getIcon());
    });

    soundOutput.getDefaultSpeaker().connect('notify', () => {
        setIcon(soundOutput.getIcon());
    });

    return (
        <SymbolButton
            classes={{ root: cn(classes?.root, 'sound-output-button') }}
        >
            <label
                class={cn(classes?.label, 'sound-output-button__label')}
                label={icon(v => v.icon)}
            />
        </SymbolButton>
    );
}
