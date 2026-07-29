import { WindowType } from '../../../types/windowing';
import { ActionModalCommand } from '../../../models/Modal/types/windowing';
import { ActionModal } from '../../../shared';
import { IWindowFactoryComponentWrapper } from '../types';

export interface IActionModalWrapper extends IWindowFactoryComponentWrapper<WindowType.ACTION_MODAL> {}

export function ActionModalWrapper(props: IActionModalWrapper) {
    const { window, proxy } = props;

    const descriptor = window.descriptor;

    return (
        <ActionModal
            summary={descriptor.props?.summary}
            actions={descriptor.props?.actions.map(({ id, ...action }) => ({
                ...action,
                onAct: () => {
                    proxy.send({
                        type: ActionModalCommand.ACT,
                        payload: { id, name: action.name, value: action.value }
                    })
                }
            }))}
        />
    );
}
