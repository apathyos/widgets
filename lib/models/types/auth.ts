import { NMSecretAgentSessionRequest } from '@/types/auth';
import { Reject, Resolve } from '@/types/common';
import { SignalCallback } from '@/types/signal';
import { Timer } from 'ags/time';
import Gio from 'gi://Gio?version=2.0';

export enum PolkitAuthCommand {
    START_SESSION,
    SHOW_INFO,
    SHOW_ERROR
}

export type PolkitAgentCommand =
    | { type: PolkitAuthCommand.START_SESSION }
    | { type: PolkitAuthCommand.SHOW_INFO, message: string }
    | { type: PolkitAuthCommand.SHOW_ERROR, message: string };

export type PolkitAuthAgentSignal = SignalCallback<PolkitAgentCommand>;

export enum NMSecretAgentCommand {
    START_SESSION,
    SHOW_INFO,
    SHOW_ERROR,
    CLOSE
}

export type NMAgentCommand =
    | { type: NMSecretAgentCommand.START_SESSION, request: NMSecretAgentSessionRequest }
    | { type: NMSecretAgentCommand.SHOW_INFO, message: string }
    | { type: NMSecretAgentCommand.SHOW_ERROR, message: string }
    | { type: NMSecretAgentCommand.CLOSE, requestId: string; };

export type NMSecretAgentSignal = SignalCallback<NMAgentCommand>;

export type NMAgentPendingRequest = {
    id: string;
    invocation: Gio.DBusMethodInvocation;
    connectionUUID: string;
    connectionPath: string;
    handle: Promise<void>;
    resolve: Resolve;
    reject: Reject;
    isAwaitingSecret?: boolean;
    secretsWereProvided?: boolean;
    connectionTimer?: Timer;
};
