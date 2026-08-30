import { SoundOutput } from '../../models/SoundOutput';
import WP from 'gi://AstalWp?version=0.1';
import { ISymbolPopupButton, SymbolPopupButton } from '../../shared';
import { Classes } from '../../types/utils';
import { createState } from 'gnim';
import { Gtk } from 'ags/gtk4';
import { Placement } from '../../types/common';
import { stableAccessor, unpackAccessor } from '@/utils/misc';
import { isNonNullableAccessor } from '@/utils/typeguards';

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
    const soundOutput = new SoundOutput(WirePlumberService);

    const [outputs, setOutputs] = createState(soundOutput.getOutputs());
    const [icon, setIcon] = createState(soundOutput.getIcon());

    const values = stableAccessor(outputs, { compose: outputs => outputs?.map(o => String(o.id)) ?? [] });

    soundOutput.getDefaultMic().connect('notify', () => {
        setOutputs(soundOutput.getOutputs());
        setIcon(soundOutput.getIcon());
    });

    soundOutput.getDefaultSpeaker().connect('notify', () => {
        setOutputs(soundOutput.getOutputs());
        setIcon(soundOutput.getIcon());
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
        >
            <label label={icon(v => v.icon)} hexpand halign={Gtk.Align.CENTER} />
        </SymbolPopupButton>
    );
}
