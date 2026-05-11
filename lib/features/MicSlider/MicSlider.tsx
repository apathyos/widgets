import WP from 'gi://AstalWp?version=0.1';
import { SymbolSlider } from '../../shared';
import { Volume } from '../../models/Volume';
import { SoundOutput } from '../../models/SoundOutput';
import { createComputed, createState } from 'gnim';
import { updateAccessor } from '../../utils/misc';
import { Classes } from '../../types/utils';
import cn from 'classnames';

const WirePlumberService = WP.get_default();

export interface IMicSlider {
    classes?: Classes<'root' | 'label'>;
}

export function MicSlider(props: IMicSlider) {
    const { classes } = props;

    const volume = new Volume(WirePlumberService);
    const output = new SoundOutput(WirePlumberService);

    const [currentVolume, setCurrentVolume] = createState(output.getDefaultMic().volume);
    const [isMuted, setIsMuted] = createState(output.getDefaultMic().mute);

    const icon = createComputed((get) => volume.getMicIcon({ volume: get(currentVolume), isMuted: get(isMuted) }));

    const updateState = () => {
        const currentMic = output.getDefaultMic();

        if (!currentMic) {
            return;
        }

        setCurrentVolume(currentMic.volume);
        setIsMuted(currentMic.mute);
    };

    output.getDefaultMic().connect('notify', updateState);
    output.getDefaultSpeaker().connect('notify', updateState);

    return (
        <SymbolSlider
            min={0}
            max={1}
            value={currentVolume}
            onClick={() => output.getDefaultMic()?.set_mute(!isMuted.get())}
            onChange={({ event: { value } }) => output.getDefaultMic()?.set_volume(value)}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'mic-slider')),
            }}
        >
            <label
                class={updateAccessor(
                    classes?.label,
                    (label, get) => cn(label, 'mic-slider__label', get(isMuted) && 'mic-slider__label_muted')
                )}
                label={icon}
            />
        </SymbolSlider>
    );
}
