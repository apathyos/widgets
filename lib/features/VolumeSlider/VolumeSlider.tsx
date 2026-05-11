import WP from 'gi://AstalWp?version=0.1';
import { SymbolSlider } from '../../shared';
import { Volume } from '../../models/Volume';
import { SoundOutput } from '../../models/SoundOutput';
import { createComputed, createState } from 'gnim';
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
