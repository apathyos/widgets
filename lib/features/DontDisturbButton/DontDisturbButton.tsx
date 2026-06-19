import cn from 'classnames';
import { SymbolButton } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import { createEffect, createState } from 'gnim';
import { sendRequest } from '../../rpc/utils';
import { getDontDisturbCommandRequest, getDontDisturbQueryRequest } from '../../rpc';
import { DontDisturbCommandResponse, DontDisturbQueryResponse } from '../../rpc/types/notifications';

export interface IDontDisturbButton {
    classes?: Classes<'root' | 'label'>;
}

export function DontDisturbButton(props: IDontDisturbButton) {
    const { classes } = props;

    const [isMuted, setIsMuted] = createState(false);

    createEffect(async () => {
        const queryResponse = await sendRequest<DontDisturbQueryResponse>(
            getDontDisturbQueryRequest(),
        );

        queryResponse && setIsMuted(queryResponse.notifications.dontDisturb);
    });

    return (
        <SymbolButton
            onClick={async () => {
                const queryResponse = await sendRequest<DontDisturbQueryResponse>(
                    getDontDisturbQueryRequest(),
                );

                if (!queryResponse) {
                    return;
                }

                const commandResponse = await sendRequest<DontDisturbCommandResponse>(
                    getDontDisturbCommandRequest(!queryResponse.notifications.dontDisturb),
                );

                if (!commandResponse) {
                    return;
                }

                setIsMuted(commandResponse.notifications.dontDisturb);
            }}
            classes={{
                root: updateAccessor(
                    classes?.root,
                    (root, get) => cn(root, 'dont-disturb-button', get(isMuted) && 'dont-disturb-button_muted')
                )
            }}
            hexpand={false}
        >
            <label
                class={updateAccessor(classes?.label, (label) => cn(label, 'dont-disturb-button__label'))}
                label={isMuted((isMuted) => (isMuted ? '' : ''))}
                hexpand
            />
        </SymbolButton>
    );
}
