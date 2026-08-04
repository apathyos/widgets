import { createEffect, createState } from 'gnim';
import { ActionModal, IInput, Input } from '../../shared';
import { unpackAccessor } from '../../utils/misc';
import { Spacing } from '@/types/common';
import { ActionModalAction } from '@/shared/ActionModal/types';

export interface IInputModal extends Pick<IInput, 'type' | 'text' | 'placeholder' | 'isFocused' | 'info' | 'onChange'> {
    onSubmit?: (args: { value: string }) => Promise<void>;
    onCancel?: () => void;
}

export function InputModal(props: IInputModal) {
    const { type, placeholder, isFocused, info, onSubmit, onCancel, onChange } = props;

    const [text, setText] = createState('');
    const [isLoading, setIsLoading] = createState(false);

    createEffect(() => setText(unpackAccessor(props.text ?? '')));

    const actions: ActionModalAction[] = [
        {
            name: 'Submit',
            value: 'submit',
            payload: { isLoading: isLoading },
            onAct: async () => {
                setIsLoading(true);
                await onSubmit?.({ value: unpackAccessor(text) });
                setIsLoading(false);
            },
        },
        {
            name: 'Cancel',
            value: 'cancel',
            onAct: () => onCancel?.()
        },
    ];

    return (
        <ActionModal
            classes={{ root: 'input-modal'}}
            spacing={Spacing.S}
            summaryNaturalHeight
            summary={(
                <Input
                    type={type}
                    text={text}
                    placeholder={placeholder}
                    isFocused={isFocused}
                    info={info}
                    onChange={({ value }) => {
                        setText(value);
                        onChange?.({ value });
                    }}
                    onSubmit={async (value) => {
                        setIsLoading(true);
                        await onSubmit?.(value);
                        setIsLoading(false);
                    }}
                />
            )}
            actions={actions}
        />
    );
}
