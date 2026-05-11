import { AlbumCoverSize } from '../../types/albumCover';
import { Classes, PropertyValue } from '../../types/utils';
import { getCoverSize } from '../../utils/albumCover';
import { toAccessor, updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface IAlbumCover {
    file?: PropertyValue<string>;
    size?: PropertyValue<AlbumCoverSize>;
    classes?: Classes<'root'>;
}

export function AlbumCover(props: IAlbumCover) {
    const { file, size = AlbumCoverSize.M, classes } = props;

    return (
        <image
            class={updateAccessor(classes?.root, (root) => cn(root, 'album-cover', `album-cover_${size}`))}
            pixel_size={toAccessor(size)((v) => getCoverSize(v))}
            file={file}
        />
    );
}
