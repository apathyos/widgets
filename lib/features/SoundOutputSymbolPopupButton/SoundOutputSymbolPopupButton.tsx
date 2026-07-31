import { SoundOutput } from '../../models/SoundOutput';
import WP from 'gi://AstalWp?version=0.1';
import { ISymbolPopupButton, SymbolPopupButton } from '../../shared';
import { Classes } from '../../types/utils';
import { createState } from 'gnim';
import { Gtk } from 'ags/gtk4';
import { Placement } from '../../types/common';

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
            onSelect={({ value }) => {
                const output = soundOutput.getOutputById({ id: +value });
                output?.set_is_default(true);
            }}
            items={outputs(v => v?.map(output => ({
                name: output.description ?? '',
                value: String(output.id),
                isActive: output.get_is_default()
            })) ?? [])}
            popupPlacement={Placement.BOTTOM}
        >
            <label label={icon(v => v.icon)} hexpand halign={Gtk.Align.CENTER} />
        </SymbolPopupButton>
    );
}
