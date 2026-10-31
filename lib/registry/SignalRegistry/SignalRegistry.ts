import { Dispose } from '@/types/common';
import { SignalCallback } from '@/types/signal';

export class SignalRegistry<C, R = void> {
    private signals: Map<string, SignalCallback<C, R>[]> = new Map();

    register(cb: SignalCallback<C, R>, id = 'signals'): Dispose {
        this.signals.set(id, [...(this.signals.get(id) ?? []), cb]);

        return () => {
            const newSignals = this.signals.get(id)?.filter(signal => signal !== cb) ?? [];

            if (!newSignals.length) {
                this.signals.delete(id);
            }

            this.signals.set(id, newSignals);
        };
    }

    clean(id = 'signals') {
        this.signals.delete(id);
    }

    emit(command: C, result: R, id = 'signals') {
        this.signals.get(id)?.forEach(cb => cb(command, result));
    }
}
