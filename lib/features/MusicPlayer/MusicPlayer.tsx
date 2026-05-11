import { Gtk } from 'ags/gtk4';
import { AlbumCover, PlayerControls, PlayerSeeker, SongMetaLabel } from '../../shared';
import { Mpris } from '../../models/Mpris';
import MprisModule from 'gi://AstalMpris?version=0.1';
import { createBinding, createComputed, With } from 'gnim';
import { AlbumCoverSize } from '../../types/albumCover';
import { SPACING_M, SPACING_S } from '../../constants/widget';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';

const MprisService = MprisModule.get_default();

export interface IMusicPlayer {
    classes?: Classes<'root'>;
}

export function MusicPlayer(props: IMusicPlayer) {
    const { classes } = props;

    const mpris = new Mpris(MprisService);
    let player = mpris.getPlayer();

    const isPlayerAvailable = createBinding(player, 'trackid').as(v => !!v);
    const length = createBinding(player, 'length');
    const position = createBinding(player, 'position');
    const playbackStatus = createBinding(player, 'playbackStatus');
    const isPaused = createComputed(get => !get(isPlayerAvailable) || get(playbackStatus) !== MprisModule.PlaybackStatus.PLAYING);
    const coverArt = createBinding(player, 'coverArt');
    const title = createBinding(player, 'title');
    const album = createBinding(player, 'album');
    const artist = createBinding(player, 'artist');

    MprisService.connect('notify', () => (player = mpris.getPlayer()));

    const onPlay = () => player.play_pause();
    const onPrev = () => player.previous();
    const onNext = () => player.next();

    return (
        <box
            orientation={Gtk.Orientation.VERTICAL}
            hexpand
            class={updateAccessor(classes?.root, root => cn(root, 'music-player'))}
        >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={SPACING_M} visible={isPlayerAvailable((v) => !!v)}>
                <AlbumCover file={coverArt} size={AlbumCoverSize.M} />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING_S}>
                    <SongMetaLabel label={title} />
                    <With value={album}>{(album) => album && <SongMetaLabel label={album} />}</With>
                    <SongMetaLabel label={artist} />
                </box>
            </box>

            <PlayerControls
                isPaused={isPaused}
                onPlay={onPlay}
                onPrev={onPrev}
                onNext={onNext}
            />
            <box visible={isPlayerAvailable((v) => !!v)} hexpand>
                <PlayerSeeker
                    min={0}
                    max={length}
                    value={position}
                    onChange={({ event }) => player.set_position(event.value)}
                />
            </box>
        </box>
    );
}
