import { APP_ID } from './os';

export const POLKIT_AUTHORITY_NAME = 'org.freedesktop.PolicyKit1';
export const POLKIT_AUTHORITY_PATH = '/org/freedesktop/PolicyKit1/Authority';
export const POLKIT_AUTHORITY_INTERFACE = 'org.freedesktop.PolicyKit1.Authority';

export const POLKIT_AGENT_PATH = `/org/${APP_ID}/PolicyKit1/AuthenticationAgent`;
export const POLKIT_CANCELLED_ERROR = 'org.freedesktop.PolicyKit1.Error.Cancelled';
export const POLKIT_FAILED_ERROR = 'org.freedesktop.PolicyKit1.Error.Failed';

export const NM_BUS_NAME = 'org.freedesktop.NetworkManager';

export const NM_SETTINGS_CONNECTION_PATH = '/org/freedesktop/NetworkManager/Settings/Connection';
export const NM_SETTINGS_CONNECTION_INTERFACE = 'org.freedesktop.NetworkManager.Settings.Connection';

export const NM_AGENT_PATH = '/org/freedesktop/NetworkManager/SecretAgent';
export const NM_AGENT_INTERFACE = 'org.freedesktop.NetworkManager.SecretAgent';
export const NM_AGENT_MANAGER_PATH = '/org/freedesktop/NetworkManager/AgentManager';
export const NM_AGENT_MANAGER_INTERFACE = 'org.freedesktop.NetworkManager.AgentManager';
export const NM_AGENT_IDENTIFIER = `org.${APP_ID}.NetworkManagerSecretAgent`;
