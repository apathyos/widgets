import {
    NOTIFICATION_TOAST_MAX_BODY_WIDTH_CHARS,
    NOTIFICATION_TOAST_MAX_CONTENT_LINES,
    NOTIFICATION_TOAST_MAX_SUMMARY_WIDTH_CHARS,
    NOTIFICATION_TOAST_MAX_TITLE_WIDTH_CHARS,
    NOTIFICATION_TOAST_MIN_CONTENT_LINES
} from '../../../constants/widget';
import { Notification } from '../../Notification/Notification';
import { INotificationToastBase, NotificationToastVariant } from '../types';

export interface INotificationOsdToast extends INotificationToastBase {
    variant: NotificationToastVariant.OSD;
}

export function NotificationOsdToast(props: INotificationOsdToast) {
    const {
        title,
        summary,
        body,
        onClose,
    } = props;

    return (
        <Notification
            title={title}
            summary={summary}
            body={body}
            onClose={onClose}
            closable
            expandable={false}
            minContentLines={NOTIFICATION_TOAST_MIN_CONTENT_LINES}
            maxContentLines={NOTIFICATION_TOAST_MAX_CONTENT_LINES}
            maxTitleWidthChars={NOTIFICATION_TOAST_MAX_TITLE_WIDTH_CHARS}
            maxSummaryWidthChars={NOTIFICATION_TOAST_MAX_SUMMARY_WIDTH_CHARS}
            maxBodyWidthChars={NOTIFICATION_TOAST_MAX_BODY_WIDTH_CHARS}
            classes={{
                root: 'notification-osd-toast',
                title: 'notification-osd-toast__title',
                body: 'notification-osd-toast__body'
            }}
        />
    );
}
