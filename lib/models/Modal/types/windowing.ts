import { IActionModal } from '../../../shared/ActionModal';
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

export type ActionModalWindowCommand =
    | WindowCommandBase<ActionModalCommand.ACT, { id: ActionModalSubCommand, name: string, value: string }>
    | WindowCommandBase<ActionModalCommand.CLOSE>;

export type ActionModalWindowOpenCommandProps = Serializable<{
    summary?: string;
    actions: (UnpackAccessor<Required<IActionModal>['actions']>[0] & { id: ActionModalSubCommand })[];
}>;
