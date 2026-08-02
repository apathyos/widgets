import MprisModule from 'gi://AstalMpris?version=0.1';
import { Accessor, createBinding, createExternal } from 'gnim';
import { unpackAccessor } from '../../utils/misc';
import { Delay } from '@/types/common';

export class Mpris {
    private readonly mpris = MprisModule.get_default();

    readonly busName = 'org.mpris.MediaPlayer2.playerctld';
    readonly player: Accessor<MprisModule.Player | null>;

    constructor() {
        this.player = createExternal<MprisModule.Player | null>(null, (setPlayer) => {
            const players = createBinding(this.mpris, 'players');

            const update = (players: MprisModule.Player[]) => {
                if (!players.length) {
                    setPlayer(null);
                }

                if (players.length && !unpackAccessor(this.player)) {
                    setPlayer(this.getDefaultPlayer());
                }
            };

            const timer = setTimeout(() => update(this.mpris.players));

            const playersSub = players.subscribe(() => {
                clearTimeout(timer);
                update(unpackAccessor(players));
            });

            return () => {
                playersSub();
                setPlayer(null);
            };
        });
    }

    private getDefaultPlayer() {
        return MprisModule.Player.new(this.busName);
    }
}
