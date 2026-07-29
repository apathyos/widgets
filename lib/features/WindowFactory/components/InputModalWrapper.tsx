import { WindowType } from '../../../types/windowing';
import { IWindowFactoryComponentWrapper } from '../types';
import { InputModal } from '../../InputModal';
import { InputModalCommand } from '../../../models/Modal/types/windowing';

export interface IInputModalWrapper extends IWindowFactoryComponentWrapper<WindowType.INPUT_MODAL> {}

export function InputModalWrapper(props: IInputModalWrapper) {
    const { window, proxy } = props;

    const descriptor = window.descriptor;

    return (
        <InputModal
            type={descriptor.props.type}
            placeholder={descriptor.props.placeholder}
            focused={descriptor.props.focused}
            onSubmit={({ value }) => proxy.send({ type: InputModalCommand.SUBMIT, payload: { value } })}
            onCancel={() => proxy.close()}
        />
    );
}
