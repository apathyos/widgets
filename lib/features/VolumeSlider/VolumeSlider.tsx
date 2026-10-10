import WP from 'gi://AstalWp?version=0.1';
import { SymbolSlider } from '../../shared';
import { Volume } from '../../models/Volume';
import { SoundOutput } from '../../models/SoundOutput';
import { createComputed, createState, onCleanup } from 'gnim';
import { Classes } from '../../types/utils';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';

const WirePlumberService = WP.get_default();

export interface IVolumeSlider {
    classes?: Classes<'root' | 'label'>;
}

export function VolumeSlider(props: IVolumeSlider) {
    const { classes } = props;

    const volume = new Volume(WirePlumberService);
    const output = new SoundOutput(WirePlumberService);

    const [currentVolume, setCurrentVolume] = createState(output.getDefaultSpeaker().volume);
    const [isMuted, setIsMuted] = createState(output.getDefaultSpeaker().mute);

    const defaultMic = output.getDefaultMic();
    const defaultSpeaker = output.getDefaultSpeaker();
    const volumeIcon = createComputed((get) => volume.getOutputIcon({ volume: get(currentVolume), isMuted: get(isMuted) }));

    const updateState = () => {
        const currentSpeaker = output.getDefaultSpeaker();

        if (!currentSpeaker) {
            return;
        }

        setCurrentVolume(currentSpeaker.volume);
        setIsMuted(currentSpeaker.mute);
    };

    const micSub = defaultMic.connect('notify', updateState);
    const speakerSub = defaultSpeaker.connect('notify', updateState);

    onCleanup(() => {
        defaultMic.disconnect(micSub);
        defaultSpeaker.disconnect(speakerSub);
    });

    return (
        <SymbolSlider
            min={0}
            max={1}
            value={currentVolume}
            onClick={() => output.getDefaultSpeaker()?.set_mute(!unpackAccessor(isMuted))}
            onChange={({ event: { value } }) => output.getDefaultSpeaker()?.set_volume(value)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'volume-slider')),
            }}
        >
            <label
                class={updateAccessor(
                    classes?.label,
                    (label, get) => cn(label, 'volume-slider__label', `volume-slider__label_${get(volumeIcon).level}`)
                )}
                label={volumeIcon(v => v.icon)}
            />
        </SymbolSlider>
    );
}
