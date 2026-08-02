import { Gtk } from 'ags/gtk4';
import { AlbumCover, PlayerControls, PlayerSeeker, SongMetaLabel } from '../../shared';
import { Mpris } from '../../models/Mpris';
import MprisModule from 'gi://AstalMpris?version=0.1';
import { createBinding, createComputed, With } from 'gnim';
import { AlbumCoverSize } from '../../types/albumCover';
import { SPACING_M, SPACING_S } from '../../constants/widget';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import { execution } from '@apathoid/utils';
import { Delay } from '../../types/common';

export interface IMusicPlayer {
    classes?: Classes<'root'>;
}

export function MusicPlayer(props: IMusicPlayer) {
    const { classes } = props;

    const mpris = new Mpris();
    const player = mpris.player;

    const onPlay = () => unpackAccessor(player)?.play_pause();
    const onPrev = () => unpackAccessor(player)?.previous();
    const onNext = () => unpackAccessor(player)?.next();

    const seekWithDebounce = execution.asyncDebounce(async (value: number) => {
        return unpackAccessor(player)?.set_position(value);
    }, Delay.M);

    return (
        <With value={player}>
            {player => {
                if (!player) {
                    return <PlayerControls isPaused />;
                }

                const isPlayerAvailable = createBinding(player, 'trackid').as(v => !!v);
                const length = createBinding(player, 'length');
                const position = createBinding(player, 'position');
                const playbackStatus = createBinding(player, 'playbackStatus');
                const isPaused = createComputed(get => {
                    return !get(isPlayerAvailable) || get(playbackStatus) !== MprisModule.PlaybackStatus.PLAYING;
                });
                const coverArt = createBinding(player, 'coverArt');
                const title = createBinding(player, 'title');
                const album = createBinding(player, 'album');
                const artist = createBinding(player, 'artist');

                return (
                    <box
                        class={updateAccessor(classes?.root, root => cn(root, 'music-player'))}
                        orientation={Gtk.Orientation.VERTICAL}
                        hexpand
                    >
                        <box visible={isPlayerAvailable} orientation={Gtk.Orientation.HORIZONTAL} spacing={SPACING_M}>
                            <AlbumCover file={coverArt} size={AlbumCoverSize.M} />
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING_S}>
                                <SongMetaLabel label={title} />
                                <With value={album}>
                                    {album => album && <SongMetaLabel label={album} />}
                                </With>
                                <SongMetaLabel label={artist} />
                            </box>
                        </box>

                        <PlayerControls
                            isPaused={isPaused}
                            onPlay={onPlay}
                            onPrev={onPrev}
                            onNext={onNext}
                        />

                        <box visible={isPlayerAvailable} hexpand>
                            <PlayerSeeker
                                min={0}
                                max={length}
                                value={position}
                                onChange={({ event }) => seekWithDebounce(event.value)}
                            />
                        </box>
                    </box>
                );
            }}
        </With>
    );
}
