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

export enum AuthBusMethod {
    RegisterAuthenticationAgent = 'RegisterAuthenticationAgent',
    UnregisterAuthenticationAgent = 'UnregisterAuthenticationAgent'
}

export enum AuthBusMethodSignature {
    RegisterAuthenticationAgent = '((sa{sv})ss)',
    UnregisterAuthenticationAgent = '((sa{sv})o)'
}

export enum AuthAgentSessionSignal {
    REQUEST = 'request',
    SHOW_INFO = 'show-info',
    SHOW_ERROR = 'show-error',
    COMPLETED = 'completed',
}

export type ActiveAuthRequest = {
    actionId: string;
    message: string;
    cookie: string;
    identity: Polkit.Identity;
    invocation: Gio.DBusMethodInvocation;
};

export type PolkitIdentityDetails = Partial<Record<PolkitIdentityDetailsEntry, GLib.Variant>>;

export type PolkitIdentity = [kind: PolkitIdentityKind, details: PolkitIdentityDetails];

export type BeginAuthParameters = [
    actionId: string,
    message: string,
    iconName: string,
    details: Record<string, string>,
    cookie: string,
    identities: PolkitIdentity[],
];
