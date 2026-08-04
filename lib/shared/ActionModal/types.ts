import { Action } from '@/types/common';
import { PropertyValue } from '@/types/utils';

export type ActionModalActionPayload = {
    isLoading?: PropertyValue<boolean>;
    isDisabled?: PropertyValue<boolean>;
};

export type ActionModalAction = Action<ActionModalActionPayload>;
