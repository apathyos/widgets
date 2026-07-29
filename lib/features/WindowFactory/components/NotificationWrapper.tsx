import { createState, onCleanup } from 'gnim';
import { WindowType } from '../../../types/windowing';
import { NotificationCommand } from '../../../models/Notification/types/windowing';
import { NotificationToast } from '../../../shared';
import { IWindowFactoryComponentWrapper } from '../types';

export interface INotificationWrapper extends IWindowFactoryComponentWrapper<WindowType.NOTIFICATION> {}

export function NotificationWrapper(props: INotificationWrapper) {
    const { window, proxy } = props;

    const descriptor = window.descriptor;

    const [title, setTitle] = createState(descriptor.props.title);
    const [summary, setSummary] = createState(descriptor.props.summary);
    const [body, setBody] = createState(descriptor.props.body);
    const [isHovered, setIsHovered] = createState(false);

    const toggleHovered = (value: boolean) => {
        setIsHovered(value);
        proxy.send({ type: NotificationCommand.HOVER, payload: { value } });
    };

    const signalSub = proxy.signal((command) => {
        if (command.type === NotificationCommand.UPDATE) {
            const { title, summary, body } = command.payload;

            title !== undefined && setTitle(title);
            summary !== undefined && setSummary(summary);
            body !== undefined && setBody(body);
        }
    });

    onCleanup(() => signalSub());

    return (
        <NotificationToast
            variant={descriptor.props.variant}
            title={title}
            summary={summary}
            body={body}
            isExpanded={isHovered}
            onClose={() => proxy.send({ type: NotificationCommand.CLOSE })}
            onMouseEnter={() => toggleHovered(true)}
            onMouseLeave={() => toggleHovered(false)}
        />
    );
}
