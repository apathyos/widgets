import { WindowCommand, WindowControllerContext } from '@/models/types/windowing';
import { InputModalController } from '../Input';
import { WindowCommandResult, WindowType } from '@/types/windowing';
import { NetworkManagerSecretAgent } from '@/models/Auth/NetworkManagerSecretAgent';
import { InputModalCommand } from '@/models/Modal/types/windowing';
import { NMSecretAgentSessionRequest } from '@/types/auth';

export class NetworkManagerSecretAgentInputModalController extends InputModalController {
    constructor(
        protected readonly context: WindowControllerContext<WindowType.INPUT_MODAL>,
        protected readonly nmSecretAgent: NetworkManagerSecretAgent,
        protected request: NMSecretAgentSessionRequest
    ) {
        super(context);
    }

    async dispatch(command: WindowCommand[WindowType.INPUT_MODAL]): Promise<WindowCommandResult> {
        try {
            let isHandled = false;

            if (command.type === InputModalCommand.SUBMIT) {
                await this.request.submit(command.payload.value);
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

    updateRequest(request: NMSecretAgentSessionRequest) {
        this.request = request;
    }
}
