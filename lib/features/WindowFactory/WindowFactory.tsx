import { useWindowSystem } from '../../contexts/windowing';
import { AnyWindow } from '../../models/types/windowing';
import { WindowType } from '../../types/windowing';
import { ActionModalWrapper } from './components/ActionModalWrapper';
import { NotificationWrapper } from './components/NotificationWrapper';

export type IWindowFactory = {
    window: AnyWindow;
};

export function WindowFactory(props: IWindowFactory) {
    const { window } = props;

    const { service } = useWindowSystem();

    if (window.type === WindowType.NOTIFICATION) {
        return <NotificationWrapper window={window} proxy={service.createWindowProxy(window.id, window.type)} />;
    }

    if (window.type === WindowType.ACTION_MODAL) {
        return <ActionModalWrapper window={window} proxy={service.createWindowProxy(window.id, window.type)} />;
    }

    return <box />;
}
