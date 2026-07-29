import { NotificationCommand } from '../../models/Notification/types/windowing';
import { WindowCommand } from '../../models/types/windowing';
import { WindowCommandResult, WindowType } from '../../types/windowing';
import { WindowController } from '../Window';

export class NotificationController extends WindowController<WindowType.NOTIFICATION> {
    async dispatch(command: WindowCommand[WindowType.NOTIFICATION]): Promise<WindowCommandResult> {
        try {
            if (command.type === NotificationCommand.CLOSE) {
                return await this.context.self.close();
            }
        } catch (error) {
            return { isSuccess: false, error };
        }

        return super.dispatch(command);
    }
}
