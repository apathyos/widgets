import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';
import { SymbolButton } from '../buttons';
import { Gtk } from 'ags/gtk4';
import { SPACING_XL } from '../../constants/widget';

export interface IPlayerControls {
    isPaused?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'prev' | 'next' | 'play'>;
    onPrev?: () => void;
    onNext?: () => void;
    onPlay?: () => void;
}

export function PlayerControls(props: IPlayerControls) {
    const { isPaused, classes, onPrev, onNext, onPlay } = props;

    return (
        <box
            class={updateAccessor(classes?.root, (root) => cn(root, 'player-controls'))}
            hexpand
            spacing={SPACING_XL}
            halign={Gtk.Align.BASELINE_CENTER}
        >
            <SymbolButton
                onClick={onPrev}
                classes={{
                    root: updateAccessor(
                        classes?.prev,
                        (prev) => cn(prev, 'player-controls__button', 'player-controls__button_prev')
                    )
                }}
            >
                
            </SymbolButton>
            <SymbolButton
                onClick={onPlay}
                classes={{
                    root: updateAccessor(
                        classes?.play,
                        (play) => cn(play, 'player-controls__button', 'player-controls__button_play')
                    )
                }}
            >
                <label label={toAccessor(isPaused)((v) => (v ? '' : ''))} />
            </SymbolButton>
            <SymbolButton
                onClick={onNext}
                classes={{
                    root: updateAccessor(
                        classes?.next,
                        (next) => cn(next, 'player-controls__button', 'player-controls__button_next')
                    )
                }}
            >
                
            </SymbolButton>
        </box>
    );
}
