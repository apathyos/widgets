import {
    NOTIFICATION_TOAST_MAX_BODY_WIDTH_CHARS,
    NOTIFICATION_TOAST_MAX_CONTENT_LINES,
    NOTIFICATION_TOAST_MAX_SUMMARY_WIDTH_CHARS,
    NOTIFICATION_TOAST_MAX_TITLE_WIDTH_CHARS,
    NOTIFICATION_TOAST_MIN_CONTENT_LINES
} from '../../../constants/widget';
import { PropertyValue } from '../../../types/utils';
import { Notification } from '../../Notification/Notification';
import { INotificationToastBase, NotificationToastVariant } from '../types';

export interface INotificationAppToast extends INotificationToastBase {
    variant: NotificationToastVariant.APP;
    isExpanded?: PropertyValue<boolean>;
}

export function NotificationAppToast(props: INotificationAppToast) {
    const {
        title,
        summary,
        body,
        isExpanded,
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
            isExpanded={isExpanded}
            minContentLines={NOTIFICATION_TOAST_MIN_CONTENT_LINES}
            maxContentLines={NOTIFICATION_TOAST_MAX_CONTENT_LINES}
            maxTitleWidthChars={NOTIFICATION_TOAST_MAX_TITLE_WIDTH_CHARS}
            maxSummaryWidthChars={NOTIFICATION_TOAST_MAX_SUMMARY_WIDTH_CHARS}
            maxBodyWidthChars={NOTIFICATION_TOAST_MAX_BODY_WIDTH_CHARS}
            classes={{
                root: 'notification-app-toast',
                title: 'notification-app-toast__title',
                body: 'notification-app-toast__body'
            }}
        />
    );
}
