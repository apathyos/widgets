import { createSubprocess } from 'ags/process';
import { Accessor } from 'gnim';
import { unpackAccessor } from '../../utils/misc';

export abstract class Socket<T = string> {
    private subprocess: Accessor<T | null> | null = null;
    private transform: ((value: string, prev: T | null) => T | null) | null = null;

    constructor(protected addr: string, opts?: {
        transform?: (value: string, prev: T | null) => T | null;
    }) {
        const { transform } = opts ?? {};

        this.transform = transform ?? null;
    }

    listen(cb: (value: T | null) => void) {
        if (!this.subprocess) {
            this.subprocess = createSubprocess<T | null>(null, `socat - UNIX-CONNECT:${this.addr}`, this.transform as never);
        }

        return this.subprocess.subscribe(() => cb(unpackAccessor(this.subprocess)));
    }
}
