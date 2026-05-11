import { IProgressOverlay } from '../ProgressOverlay';
import { createState } from 'gnim';
import { toAccessor, unpackAccessor } from '../../../utils/misc';
import { timeout, Timer } from 'ags/time';
import { PropertyValue } from '../../../types/utils';

export interface IwithDuration extends Omit<IProgressOverlay, 'value'> {
    duration: PropertyValue<number>;
    isInProgress: PropertyValue<boolean>;
    onDone?: () => void;
};

export function withDuration(Component: (props: IProgressOverlay) => JSX.Element) {
    return (props: IwithDuration) => {
        const { duration, isInProgress, onDone } = props;

        let timer: Timer | null = null;

        const [value, setValue] = createState(0);

        value.subscribe(() => {
            if (unpackAccessor(value) === 100) {
                onDone?.();
            }
        });

        toAccessor((isInProgress)).subscribe(() => {
            const dur = unpackAccessor(duration);
            const step = dur / 100;

            if (unpackAccessor(isInProgress)) {
                timer = timeout(step, function update() {
                    if (unpackAccessor(value) === 100) {
                        timer = null;
                        return;
                    }

                    setValue(p => p + 1);
                    timer = timeout(step, update);
                });
            } else {
                timer?.cancel();
                timer = null;
                setValue(0);
            }
        });

        return (
            <Component {...props} value={value} />
        );
    };
}
