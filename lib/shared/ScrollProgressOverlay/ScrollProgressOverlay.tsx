import { IProgressOverlay, ProgressOverlay } from '../ProgressOverlay';
import { unpackAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';
import { createState } from 'gnim';
import { timeout, Timer } from 'ags/time';
import { Delay } from '../../types/common';

export interface IScrollProgressOverlay extends IProgressOverlay {
   onChange: (value: number) => void;
}

export function ScrollProgressOverlay(props: IScrollProgressOverlay) {
    const { onChange } = props;

    const [_showValue, setShowValue] = createState(false);
    let timer: Timer | null = null;

    const scrollController = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.BOTH_AXES });

    scrollController.connect('scroll', (_, dx, dy) => {
        timer?.cancel();
        setShowValue(true);

        timer = timeout(Delay.M, () => {
            setShowValue(false);
        });

        const value = unpackAccessor(props.value);
        const scrollDirection = dx === 0 && dy !== 0 ? 'vertical' : 'horizontal';

        if (scrollDirection === 'horizontal') {
            onChange(value + dx * -1);
        }

        if (scrollDirection === 'vertical') {
            onChange(value + dy);
        }
    });

    return (
        <ProgressOverlay
            {...props}
            ref={self => self.add_controller(scrollController)}
            // showValue={showValue}
        />
    );
}
