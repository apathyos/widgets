import app from 'ags/gtk4/app';
import { createComputed, createState } from 'gnim';
import { SymbolButton } from '../../shared';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { unpackAccessor, updateAccessor } from '../../utils/misc';
import { handleRequest, sendRequest } from '../../rpc/utils';
import { getIsSetStatusPanelOpenedCommandRequest } from '../../rpc';
import { RequestType } from '../../rpc/types';

export interface IStatusPanelButton {
    classes?: Classes<'root' | 'label'>;
}

export function StatusPanelButton(props: IStatusPanelButton) {
    const { classes } = props;

    const [isPanelOpened, setIsPanelOpened] = createState(false);
    const icon = createComputed((get) => (get(isPanelOpened) ? '󰮫' : '󰍜'));

    app.connect(
        'request',
        handleRequest(
            getIsSetStatusPanelOpenedCommandRequest,
            async (request) => {
                const { statusPanel: { isOpened } } = request;

                setIsPanelOpened(isOpened);
            },
            { respondWith: () => String(unpackAccessor(isPanelOpened)) },
        ),
    );

    return (
        <SymbolButton
            onClick={() => {
                const nextState = !unpackAccessor(isPanelOpened);

                setIsPanelOpened(nextState);
                sendRequest({
                    type: RequestType.COMMAND,
                    statusPanel: { isOpened: nextState },
                });
            }}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'status-panel-button')),
            }}
        >
            <label
                class={updateAccessor(classes?.label, (label) => cn(label, 'status-panel-button__label'))}
                label={icon}
            />
        </SymbolButton>
    );
}
