import { Children } from '../../types/utils';

export interface IDummyWrapper {
    children: Children;
}

export function DummyWrapper(props: IDummyWrapper) {
    return (
        <box>
            {props.children}
        </box>
    );
}
