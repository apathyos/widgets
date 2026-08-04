import { InputModalCommand } from '../../models/Modal/types/windowing';
import { WindowCommand } from '../../models/types/windowing';
import { WindowCommandResult, WindowType } from '../../types/windowing';
import { WindowController } from '../Window';

export class InputModalController extends WindowController<WindowType.INPUT_MODAL> {
    async dispatch(command: WindowCommand[WindowType.INPUT_MODAL]): Promise<WindowCommandResult> {
        try {
            if (command.type === InputModalCommand.CLOSE) {
                return await this.context.self.close();
            }
        } catch (error) {
            return { isSuccess: false, error };
        }

        return super.dispatch(command);
    }
}
