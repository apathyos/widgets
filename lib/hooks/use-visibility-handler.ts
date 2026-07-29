import { createState } from 'gnim';
import { Element } from '../types/widget';
import { unpackAccessor } from '../utils/misc';
import { Gdk } from 'ags/gtk4';
import { getWidgetMonitor } from '../utils/display';

export const useVisibilityHandler = <T extends Element>(args: {
    onVisible: (args: { ref: T, monitor: Gdk.Monitor }) => void;
}) => {
    const { onVisible } = args;

    const [isVisibilityHandled, setIsVisibilityHandled] = createState(false);

    let ticks = 0;

    return (self: T) => {
        if (!self.visible) {
            setIsVisibilityHandled(false);
            return;
        }

        self?.add_tick_callback(() => {
            if (unpackAccessor(isVisibilityHandled) || !self.visible) {
                return false;
            }

            const monitor = getWidgetMonitor(self);

            if (!self || !monitor || ticks++ < 1) {
                return true;
            }

            setIsVisibilityHandled(true);
            onVisible?.({ ref: self, monitor });
            return false;
        });
    };
};
