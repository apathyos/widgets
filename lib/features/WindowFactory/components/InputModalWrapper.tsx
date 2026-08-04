import { WindowType } from '../../../types/windowing';
import { IWindowFactoryComponentWrapper } from '../types';
import { InputModal } from '../../InputModal';
import { InputModalCommand } from '../../../models/Modal/types/windowing';
import { createState } from 'gnim';
import { InputInfo, InputInfoType } from '@/shared/Input/types';
import { getMessageFromError } from '@/utils/error';
import { unpackAccessor } from '@/utils/misc';

export interface IInputModalWrapper extends IWindowFactoryComponentWrapper<WindowType.INPUT_MODAL> {}

export function InputModalWrapper(props: IInputModalWrapper) {
    const { window, proxy } = props;

    const descriptor = window.descriptor;

    const [info, setInfo] = createState<InputInfo | undefined>(undefined);

    proxy.signal((command) => {
        if (command.type === InputModalCommand.SET_INFO) {
            setInfo({ type: InputInfoType.INFO, isPresent: true, text: command.payload.value });
        }

        if (command.type === InputModalCommand.SET_ERROR) {
            setInfo({ type: InputInfoType.ERROR, isPresent: true, text: command.payload.value });
        }
    });

    return (
        <InputModal
            type={descriptor.props.type}
            placeholder={descriptor.props.placeholder}
            isFocused={descriptor.props.focused}
            info={info}
            onChange={() => unpackAccessor(info)?.type === InputInfoType.ERROR && setInfo(undefined)}
            onSubmit={async ({ value }) => {
                setInfo(undefined);

                const result = await proxy.send({ type: InputModalCommand.SUBMIT, payload: { value } });

                if (!result.isSuccess) {
                    const text = getMessageFromError(result.error);
                    setInfo({ type: InputInfoType.ERROR, isPresent: true, text });
                }
            }}
            onCancel={() => proxy.close()}
        />
    );
}
