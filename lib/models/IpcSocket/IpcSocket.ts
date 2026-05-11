import GLib20 from 'gi://GLib';
import { Socket } from '../base/Socket';
import { IpcEvent } from '../../types/ipc';

export class IpcSocket extends Socket<IpcEvent> {
    constructor() {
        super(`${GLib20.getenv('XDG_RUNTIME_DIR') ?? ''}/apathyos/socket.sock`, { transform: v => JSON.parse(v) });
    }
}
