import { createEffect, createState } from 'gnim';
import { timeout, Timer } from 'ags/time';
import { PropertyValue } from '@/types/utils';
import { unpackAccessor } from '@/utils/misc';

export const useDelayedValue = <T>(value: PropertyValue<T>, opts: {
    delay: number;
}) => {
    const { delay } = opts;

    const [newValue, setValue] = createState(unpackAccessor(value));

    let timerRef: Timer | null = null;

    createEffect(() => {
        const newResult = unpackAccessor(value, true);

        timerRef?.cancel();
        timerRef = timeout(delay, () => setValue(newResult));
    });

    return newValue;
};
