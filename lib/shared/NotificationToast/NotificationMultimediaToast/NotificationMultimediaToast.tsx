import { Gtk } from 'ags/gtk4';
import {
    NOTIFICATION_TOAST_MAX_BODY_WIDTH_CHARS,
    NOTIFICATION_TOAST_MAX_SUMMARY_WIDTH_CHARS,
    NOTIFICATION_TOAST_MAX_TITLE_WIDTH_CHARS,
    SPACING_L,
    SPACING_S
} from '../../../constants/widget';
import { AlbumCoverSize } from '../../../types/albumCover';
import { PropertyValue } from '../../../types/utils';
import { AlbumCover } from '../../AlbumCover';
import { Notification } from '../../Notification/Notification';
import { SongMetaLabel } from '../../SongMetaLabel';
import { INotificationToastBase, NotificationToastVariant } from '../types';
import { With } from 'gnim';
import { toAccessor } from '../../../utils/misc';

export interface INotificationMultimediaToast extends Omit<INotificationToastBase, 'title' | 'summary' | 'body'> {
    variant: NotificationToastVariant.MULTIMEDIA;
    image?: PropertyValue<string>;
}

export function NotificationMulimediaToast(props: INotificationMultimediaToast) {
    const { image, onClose } = props;

    return (
        <Notification
            body={
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={SPACING_L}>
                    <AlbumCover file={image} size={AlbumCoverSize.S} />
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING_S}>
                        <SongMetaLabel label={'label'} />
                        <With value={toAccessor('album')}>{
                            (album: string) => album && <SongMetaLabel label={album} />
                        }</With>
                        <SongMetaLabel label={'artist'} />
                    </box>
                </box>
            }
            onClose={onClose}
            closable
            expandable={false}
            maxTitleWidthChars={NOTIFICATION_TOAST_MAX_TITLE_WIDTH_CHARS}
            maxSummaryWidthChars={NOTIFICATION_TOAST_MAX_SUMMARY_WIDTH_CHARS}
            maxBodyWidthChars={NOTIFICATION_TOAST_MAX_BODY_WIDTH_CHARS}
        />
    );
}
