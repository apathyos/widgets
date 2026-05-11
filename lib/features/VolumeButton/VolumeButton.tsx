import WP from 'gi://AstalWp?version=0.1';
import { ISymbolRevealButton, SymbolSliderButton } from '../../shared';
import { createComputed, createState } from 'gnim';
import { Volume } from '../../models/Volume';
import { SoundOutput } from '../../models/SoundOutput';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';

const WirePlumberService = WP.get_default();

export interface IVolumeButton {
    classes?: ISymbolRevealButton['classes'] & Classes<'icon'>;
}

export function VolumeButton(props: IVolumeButton) {
    const { classes } = props;

    const volume = new Volume(WirePlumberService);
    const output = new SoundOutput(WirePlumberService);

    const [currentVolume, setCurrentVolume] = createState(output.getDefaultSpeaker().volume);
    const [isMuted, setIsMuted] = createState(output.getDefaultSpeaker().mute);

    const volumeIcon = createComputed((get) => volume.getOutputIcon({ volume: get(currentVolume), isMuted: get(isMuted) }));

    const updateState = () => {
        const currentSpeaker = output.getDefaultSpeaker();

        if (!currentSpeaker) {
            return;
        }

        setCurrentVolume(currentSpeaker.volume);
        setIsMuted(currentSpeaker.mute);
    };

    output.getDefaultMic().connect('notify', updateState);
    output.getDefaultSpeaker().connect('notify', updateState);

    return (
        <SymbolSliderButton
            min={0}
            max={1}
            value={currentVolume}
            onClick={() => output.getDefaultSpeaker()?.set_mute(!isMuted.get())}
            onChange={({ event: { value } }) => output.getDefaultSpeaker()?.set_volume(value)}
            classes={{
                ...classes,
                root: updateAccessor(
                    classes?.root,
                    (root, get) => cn(root, 'volume-button', `volume-button_${get(volumeIcon).level}`)
                )
            }}
        >
            <label
                class={updateAccessor(
                    classes?.icon,
                    (icon) => cn(icon, 'volume-button__icon')
                )}
                label={volumeIcon(v => v.icon)}
            />
        </SymbolSliderButton>
    );
}
