import GLib from 'gi://GLib';

export const APP_ID = 'apathyos';
export const APP_ENV_PREFIX = 'APATHY_OS';

export const OS_PATH = GLib.getenv(APP_ENV_PREFIX) ?? '/mnt/config/apathyos';

export const IPC = GLib.getenv(`${APP_ENV_PREFIX}_IPC`) ?? 'apth';
export const IPC_SOCKET_PATH = `${GLib.getenv('XDG_RUNTIME_DIR') ?? ''}/apathyos/socket.sock`;
