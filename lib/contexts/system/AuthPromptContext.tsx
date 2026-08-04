import { createContext } from 'gnim';
import { Children } from '../../types/utils';
import { AuthService } from '../../services/AuthService';

export interface IAuthPromptContext {
    service: AuthService;
}

export const AuthPromptContext = createContext({} as IAuthPromptContext);

export function useAuthPrompt() {
    return AuthPromptContext.use() ?? {};
}

export interface IAuthPromptContextProvider {
    children: Children;
    service: AuthService;
}

export function AuthPromptContextProvider(props: IAuthPromptContextProvider) {
    const { service } = props;

    return (
        <AuthPromptContext value={{ service }}>
            {props.children}
        </AuthPromptContext>
    );
}
