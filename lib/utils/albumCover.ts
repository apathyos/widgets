import { AlbumCoverSize } from '../types/albumCover';

export const getCoverSize = (size: AlbumCoverSize) => {
    let coverSize = 75;

    if (size === AlbumCoverSize.M) {
        coverSize = 150;
    }

    if (size === AlbumCoverSize.L) {
        coverSize = 300;
    }

    return coverSize;
};
