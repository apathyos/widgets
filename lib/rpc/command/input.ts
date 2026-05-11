import { KeyboardLayout } from '../../types/input';
import { Request, RequestType } from '../types';
import { KeyboardLayoutCommandRequest } from '../types/input';

export const getIsKeyboardLayoutCommandRequest = (request: Request): request is KeyboardLayoutCommandRequest => {
    return !!(
        request.type === RequestType.COMMAND &&
        'input' in request &&
        'keyboard' in request.input &&
        'layout' in request.input.keyboard && request.input.keyboard.layout
    );
};

export const getKeyboardLayoutCommandRequest = (layout: KeyboardLayout) => {
    const request: KeyboardLayoutCommandRequest = {
        type: RequestType.COMMAND,
        input: { keyboard: { layout } }
    };

    return request;
};
