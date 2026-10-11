import { SoundOutput } from '../../models/SoundOutput';
import WP from 'gi://AstalWp?version=0.1';
import { ISymbolPopupButton, SymbolPopupButton } from '../../shared';
import { Classes } from '../../types/utils';
import { createState, onCleanup } from 'gnim';
import { Gtk } from 'ags/gtk4';
import { Placement } from '../../types/common';
import { stableAccessor, unpackAccessor, updateAccessor } from '@/utils/misc';
import { isNonNullableAccessor } from '@/utils/typeguards';
import cn from 'classnames';

const WirePlumberService = WP.get_default();

export interface ISoundOutputSymbolPopupButton extends Pick<
    ISymbolPopupButton,
    | 'isRootMounted'
    | 'halign'
    | 'vexpand'
    | 'hexpand'
    > {
        classes?: Classes<'root'>;
    }

export function SoundOutputSymbolPopupButton(props: ISoundOutputSymbolPopupButton) {
    const { classes } = props;

    const soundOutput = new SoundOutput(WirePlumberService);

    const [outputs, setOutputs] = createState(soundOutput.getOutputs());
    const [icon, setIcon] = createState(soundOutput.getIcon());

    const defaultMic = soundOutput.getDefaultMic();
    const defaultSpeaker = soundOutput.getDefaultSpeaker();
    const values = stableAccessor(outputs, { compose: outputs => outputs?.map(o => String(o.id)) ?? [] });

    const micSub = defaultMic.connect('notify', () => {
        setOutputs(soundOutput.getOutputs());
        setIcon(soundOutput.getIcon());
    });

    const speakerSub = defaultSpeaker.connect('notify', () => {
        setOutputs(soundOutput.getOutputs());
        setIcon(soundOutput.getIcon());
    });

    onCleanup(() => {
        defaultMic.disconnect(micSub);
        defaultSpeaker.disconnect(speakerSub);
    });

    return (
        <SymbolPopupButton
            {...props}
            values={values}
            getItem={value => {
                const output = outputs(v => v?.find(o => String(o.id) === value));

                if (!isNonNullableAccessor(output)) {
                    return null;
                }

                return {
                    name: output(v => v.description ?? ''),
                    value: String(unpackAccessor(output).id),
                    isActive: output(v => v.get_is_default())
                };
            }}
            onSelect={({ value }) => {
                const output = soundOutput.getOutputById({ id: +value });
                output?.set_is_default(true);
            }}
            popupPlacement={Placement.BOTTOM}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            classes={{
                root: updateAccessor(classes?.root, root => cn(root, 'sound-output-symbol-popup-button'))
            }}
        >
            <label label={icon(v => v.icon)} hexpand halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
        </SymbolPopupButton>
    );
}
