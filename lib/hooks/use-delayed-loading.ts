import { Accessor, createState, Setter } from 'gnim';
import { useDelayedValue } from './use-delayed-value';

export const useDelayedLoading = <T>(initValue: T, opts: {
    delay: number;
}): [Accessor<T>, Setter<T>, Accessor<T>] => {
    const { delay } = opts;

    const [isLoading, setIsLoading] = createState(initValue);
    const isDelayedLoading = useDelayedValue(isLoading, { delay });

    return [isDelayedLoading, setIsLoading, isLoading];
};
