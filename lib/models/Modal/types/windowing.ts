import { IActionModal } from '../../../shared/ActionModal';
import { InputType } from '../../../types/input';
import { Serializable, UnpackAccessor } from '../../../types/utils';
import { WindowCommandBase } from '../../../types/windowing';

export enum ActionModalCommand {
    ACT,
    CLOSE
}

export enum ActionModalSubCommand {
    CLOSE,
    SET_CPU_PROFILE
}

export enum InputModalCommand {
    CLOSE,
    SUBMIT,
    SET_INFO,
    SET_ERROR
}

export type ActionModalWindowCommand =
    | WindowCommandBase<ActionModalCommand.ACT, { id: ActionModalSubCommand, name: string, value: string }>
    | WindowCommandBase<ActionModalCommand.CLOSE>;

export type ActionModalWindowOpenCommandProps = Serializable<{
    summary?: string;
    actions: (UnpackAccessor<Required<IActionModal>['actions']>[0] & { id: ActionModalSubCommand })[];
}>;

export type InputModalWindowCommand =
    | WindowCommandBase<InputModalCommand.SUBMIT, { value: string; }>
    | WindowCommandBase<InputModalCommand.SET_INFO, { value: string; }>
    | WindowCommandBase<InputModalCommand.SET_ERROR, { value: string; }>
    | WindowCommandBase<InputModalCommand.CLOSE>;

export type InputModalWindowOpenCommandProps = Serializable<{
    type: InputType;
    text?: string;
    placeholder?: string;
    focused?: boolean;
}>;
