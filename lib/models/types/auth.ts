export enum AuthCommand {
    START_SESSION,
    SHOW_INFO,
    SHOW_ERROR
}

export type AuthAgentCommand =
    | { type: AuthCommand.START_SESSION }
    | { type: AuthCommand.SHOW_INFO, message: string }
    | { type: AuthCommand.SHOW_ERROR, message: string };

export type AuthAgentSignal = (command: AuthAgentCommand) => void;
