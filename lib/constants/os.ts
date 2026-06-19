import GLib from 'gi://GLib';

export const APP_ID = 'apathyos';

export const OS_PATH = GLib.getenv('APATHY_OS') ?? '/mnt/config/apathyos';

export const IPC = GLib.getenv('APATHY_OS_IPC') ?? 'apth';
export const IPC_SOCKET_PATH = `${GLib.getenv('XDG_RUNTIME_DIR') ?? ''}/apathyos/socket.sock`;
