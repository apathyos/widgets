import app from 'ags/gtk4/app';
import { System } from '@/models/System';
import { ISymbol, Symbol } from '@/shared';
import { SystemInhibitor } from '@/types/system';
import { createComputed, createEffect, createState, onCleanup } from 'gnim';
import { handleRequest } from '@/rpc/utils';
import { getIsSetActiveSystemInhibitorsCommandRequest } from '@/rpc';

export interface ISystemInhibitIcon extends Pick<ISymbol, 'classes'> {}

export function SystemInhibitIcon(props: ISystemInhibitIcon) {
    const { classes } = props;

    const [activeInhibitors, setActiveInhibitors] = createState<SystemInhibitor[]>([]);

    const system = new System();

    const isInhibiting = createComputed(get => !!get(activeInhibitors).length);

    const refresh = async () => setActiveInhibitors(await system.getActiveInhibitors());

    createEffect(refresh);

    const setSystemInhibitorsReqSub = app.connect(
        'request',
        handleRequest(
            getIsSetActiveSystemInhibitorsCommandRequest,
            async (request) => {
                const { system: { activeSystemInhibitors } } = request;

                setActiveInhibitors(activeSystemInhibitors);
            },
        ),
    );

    onCleanup(() => app.disconnect(setSystemInhibitorsReqSub));

    return <Symbol isVisible={isInhibiting} label="󱫫" classes={classes} />;
}
