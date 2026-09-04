import { createContext } from 'gnim';
import { WindowService } from '../../services/WindowService';
import { Children } from '../../types/utils';

export interface IWindowSystemContext {
    service: WindowService;
}

export const WindowSystemContext = createContext({} as IWindowSystemContext);

export function useWindowSystem() {
    const system = WindowSystemContext.use();

    return system ?? {};
}

export interface IWindowSystemContextProvider {
    children: () => Children;
    service: WindowService;
}

export function WindowSystemContextProvider(props: IWindowSystemContextProvider) {
    const { service } = props;

    return (
        <WindowSystemContext value={{ service }}>
            {props.children}
        </WindowSystemContext>
    );
}
