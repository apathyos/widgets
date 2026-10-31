import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Polkit from 'gi://Polkit';

export enum PolkitIdentityKind {
    UNIX_USER = 'unix-user',
    UNIX_SESSION = 'unix-session'
}

export enum PolkitIdentityDetailsEntry {
    UID = 'uid',
    SESSION_ID = 'session-id'
}

export enum PolkitAgentBusMethod {
    RegisterAuthenticationAgent = 'RegisterAuthenticationAgent',
    UnregisterAuthenticationAgent = 'UnregisterAuthenticationAgent'
}

export const PolkitAgentBusMethodSignature = {
    [PolkitAgentBusMethod.RegisterAuthenticationAgent]: '((sa{sv})ss)',
    [PolkitAgentBusMethod.UnregisterAuthenticationAgent]: '((sa{sv})o)',
} as const;

type PolkitMethodSignature = typeof PolkitAgentBusMethodSignature;

export type PolkitAgentSignatureByMethod = {
    [PolkitAgentBusMethod.RegisterAuthenticationAgent]:
        PolkitMethodSignature[PolkitAgentBusMethod.RegisterAuthenticationAgent],
    [PolkitAgentBusMethod.UnregisterAuthenticationAgent]:
        PolkitMethodSignature[PolkitAgentBusMethod.UnregisterAuthenticationAgent],
};

export enum PolkitAgentSessionSignal {
    REQUEST = 'request',
    SHOW_INFO = 'show-info',
    SHOW_ERROR = 'show-error',
    COMPLETED = 'completed',
}

export type PolkitActiveAuthRequest = {
    actionId: string;
    message: string;
    cookie: string;
    identity: Polkit.Identity;
    invocation: Gio.DBusMethodInvocation;
};

export type PolkitIdentityDetails = Partial<Record<PolkitIdentityDetailsEntry, GLib.Variant>>;

export type PolkitIdentity = [kind: PolkitIdentityKind, details: PolkitIdentityDetails];

export type PolkitBeginAuthParameters = [
    actionId: string,
    message: string,
    iconName: string,
    details: Record<string, string>,
    cookie: string,
    identities: PolkitIdentity[],
];

export enum NMSecretAgentBusMethod {
    RegisterWithCapabilities = 'RegisterWithCapabilities',
    Unregister = 'Unregister',
    GetSecrets = 'GetSecrets',
    CancelGetSecrets = 'CancelGetSecrets',
    SaveSecrets = 'SaveSecrets',
    DeleteSecrets = 'DeleteSecrets',
    UserCanceled = 'UserCanceled',
    InternalError = 'InternalError',
    NoSecrets = 'NoSecrets',
    AgentCanceled = 'AgentCanceled',
}

export const NMSecretAgentBusMethodSignature = {
    [NMSecretAgentBusMethod.RegisterWithCapabilities]: '(su)',
    [NMSecretAgentBusMethod.Unregister]: '',
    [NMSecretAgentBusMethod.GetSecrets]: '(a{sa{sv}}ssasu)',
    [NMSecretAgentBusMethod.CancelGetSecrets]: '(ss)',
    [NMSecretAgentBusMethod.SaveSecrets]: '',
    [NMSecretAgentBusMethod.DeleteSecrets]: ''
} as const;

type NMSecretAgentMethodSignature = typeof NMSecretAgentBusMethodSignature;

export type NMSecretAgentSignatureByMethod = {
    [NMSecretAgentBusMethod.RegisterWithCapabilities]:
        NMSecretAgentMethodSignature[NMSecretAgentBusMethod.RegisterWithCapabilities];
    [NMSecretAgentBusMethod.Unregister]: NMSecretAgentMethodSignature[NMSecretAgentBusMethod.Unregister];
    [NMSecretAgentBusMethod.GetSecrets]: NMSecretAgentMethodSignature[NMSecretAgentBusMethod.GetSecrets];
    [NMSecretAgentBusMethod.CancelGetSecrets]: NMSecretAgentMethodSignature[NMSecretAgentBusMethod.CancelGetSecrets];
    [NMSecretAgentBusMethod.SaveSecrets]: NMSecretAgentMethodSignature[NMSecretAgentBusMethod.SaveSecrets];
    [NMSecretAgentBusMethod.DeleteSecrets]: NMSecretAgentMethodSignature[NMSecretAgentBusMethod.DeleteSecrets];
};

export type NMSecretAgentSessionRequest = {
    id: string;
    ssid: string | null;
    connectionPath: string;
    submit: (value: string) => Promise<void>;
};
