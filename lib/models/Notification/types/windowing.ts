import { NotificationToastVariant } from '../../../shared/NotificationToast/types';
import { Serializable } from '../../../types/utils';
import { WindowCommandBase } from '../../../types/windowing';

export enum NotificationCommand {
    CLOSE,
    UPDATE,
    HOVER,
}

export type NotificationWindowCommand =
    | WindowCommandBase<NotificationCommand.CLOSE>
    | WindowCommandBase<NotificationCommand.UPDATE, { title?: string; summary?: string; body?: string; }>
    | WindowCommandBase<NotificationCommand.HOVER, { value: boolean }>;

export type NotificationWindowOpenCommandProps = Serializable<{
    variant: NotificationToastVariant;
    title: string;
    summary?: string;
    body: string;
}>;
