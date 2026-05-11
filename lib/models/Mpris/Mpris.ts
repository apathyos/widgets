import MprisModule from 'gi://AstalMpris?version=0.1';

export class Mpris {
    constructor(private MprisService: MprisModule.Mpris) {}

    getPlayer(args?: { name?: string }): MprisModule.Player {
        const { name = 'playerctld' } = args ?? {};

        return MprisModule.Player.new(name);
    }
}
