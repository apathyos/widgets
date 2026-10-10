import cn from 'classnames';
import { Symbol } from '../../shared';
import WP from 'gi://AstalWp?version=0.1';
import { SoundOutput } from '../../models/SoundOutput';
import { createState, onCleanup } from 'gnim';

const WirePlumberService = WP.get_default();

export interface ISoundOutputSymbol {
    classes?: {
        root?: string;
        label?: string;
    };
}

export function SoundOutputSymbol(props: ISoundOutputSymbol) {
    const { classes } = props;

    const soundOutput = new SoundOutput(WirePlumberService);

    const [icon, setIcon] = createState(soundOutput.getIcon());

    const defaultMic = soundOutput.getDefaultMic();
    const defaultSpeaker = soundOutput.getDefaultSpeaker();

    const micSub = defaultMic.connect('notify', () => {
        setIcon(soundOutput.getIcon());
    });

    const speakerSub = defaultSpeaker.connect('notify', () => {
        setIcon(soundOutput.getIcon());
    });

    onCleanup(() => {
        defaultMic.disconnect(micSub);
        defaultSpeaker.disconnect(speakerSub);
    });

    return (
        <Symbol
            classes={{ root: cn(classes?.root, 'sound-output-button') }}
            label={icon(v => v.icon)}
        />
    );
}
