import { CommandRequestBase } from '.';
import { KeyboardLayout } from '../../types/input';

export type KeyboardLayoutCommandRequest = CommandRequestBase & {
    input: {
        keyboard: {
            layout: KeyboardLayout;
        }
    };
};
