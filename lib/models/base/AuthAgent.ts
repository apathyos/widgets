export abstract class AuthAgent {
    abstract register(): Promise<void>;
    abstract unregister(): Promise<void>;
}
