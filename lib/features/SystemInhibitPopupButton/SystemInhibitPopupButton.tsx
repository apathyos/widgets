import Gtk from 'gi://Gtk';
import { IPopupButton, PopupButton } from '../../shared';
import { Classes } from '../../types/utils';
import { createEffect, createState } from 'gnim';
import { SystemInhibitorType, SystemInhibitor } from '../../types/system';
import { Delay } from '../../types/common';
import { isNonNullableAccessor } from '@/utils/typeguards';
import { System } from '@/models/System';
import { unpackAccessor } from '@/utils/misc';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import { sendRequest } from '@/rpc/utils';
import { getSetActiveSystemInhibitorsCommandRequest } from '@/rpc';

export interface ISystemInhibitPopupButton<P = object> extends Pick<
    IPopupButton<P>,
    | 'isRootMounted'
    | 'halign'
    | 'vexpand'
    | 'hexpand'
> {
    classes?: Classes<'root'>;
}

export function SystemInhibitPopupButton<P>(props: ISystemInhibitPopupButton<P>) {
    const system = new System();

    const systemInhibitors = system.getSystemInhibitors();

    const [activeInhibitors, setActiveInhibitors] = createState<SystemInhibitor[]>([]);
    const [isDelayedLoading, setIsLoading, isLoading] = useDelayedLoading<SystemInhibitorType | null>(null, { delay: Delay.S });

    const refresh = async () => {
        setActiveInhibitors(await system.getActiveInhibitors());
    };

    createEffect(refresh);

    const values = systemInhibitors.map(i => i.type);

    return (
        <PopupButton
            {...props}
            values={values}
            getItem={value => {
                const inhibitor = systemInhibitors.find(i => i.type === value);

                if (!isNonNullableAccessor(inhibitor)) {
                    return null;
                }

                return {
                    name: inhibitor.name,
                    value: inhibitor.type,
                    icon: inhibitor.icon,
                    isActive: activeInhibitors(v => !!v.find(i => i.type === value)),
                    isLoading: isDelayedLoading(v => v === value),
                    isDisabled: isLoading(v => v ? v !== value : false),
                    payload: { inhibitor }
                };
            }}
            onSelect={async ({ value, payload }) => {
                const { inhibitor } = unpackAccessor(payload) ?? {};

                const type = value as SystemInhibitorType;
                const { description = '' } = inhibitor ?? {};

                setIsLoading(type);
                await system.toggleSystemInhibitor({ type: value as SystemInhibitorType, description });
                await refresh();
                sendRequest(getSetActiveSystemInhibitorsCommandRequest(unpackAccessor(activeInhibitors)));
                setIsLoading(null);
            }}
            onToggle={isOpened => isOpened && refresh()}
        >
            <label label="󱫫" hexpand halign={Gtk.Align.CENTER} />
        </PopupButton>
    );
}
