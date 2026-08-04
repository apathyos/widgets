import { WindowCommand, WindowControllerContext } from '@/models/types/windowing';
import { InputModalController } from '../Input';
import { WindowCommandResult, WindowType } from '@/types/windowing';
import { PolkitAuthAgent } from '@/models/Auth';
import { InputModalCommand } from '@/models/Modal/types/windowing';

export class AuthInputModalController extends InputModalController {
    constructor(
        protected readonly context: WindowControllerContext<WindowType.INPUT_MODAL>,
        protected readonly polkitAgent: PolkitAuthAgent
    ) {
        super(context);
    }

    async dispatch(command: WindowCommand[WindowType.INPUT_MODAL]): Promise<WindowCommandResult> {
        try {
            let isHandled = false;

            if (command.type === InputModalCommand.SUBMIT) {
                await this.polkitAgent.respond(command.payload.value);
                await this.context.self.close();
                isHandled = true;
            }

            if (isHandled) {
                return { isSuccess: true };
            }
        } catch (error) {
            return { isSuccess: false, error };
        }

        return super.dispatch(command);
    }
}
