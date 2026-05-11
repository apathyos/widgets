import { Gtk } from 'ags/gtk4';
import { IProgressOverlay, ProgressOverlay, withDuration } from '../ProgressOverlay';
import { createState } from 'gnim';
import { Delay } from '../../types/common';

export interface ILongClickProgressOverlay extends Omit<IProgressOverlay, 'value'> {
    onDone: () => void;
}

const ProgressOverlayWithDuration = withDuration(ProgressOverlay);

export function LongClickProgressOverlay(props: ILongClickProgressOverlay) {
    const { onDone } = props;

    const [isInProgress, setIsInProgress] = createState(false);

    const longClickController = new Gtk.GestureClick();

    longClickController.connect('pressed', () => setIsInProgress(true));
    longClickController.connect('end', () => setIsInProgress(false));

    return (
        <ProgressOverlayWithDuration
            {...props}
            ref={self => self.add_controller(longClickController)}
            duration={Delay.M}
            isInProgress={isInProgress}
            onDone={onDone}
        />
    );
}
