import { WindowControllerCreator } from '@/models/types/windowing';
import { WindowType } from '@/types/windowing';
import { InputType } from '@/types/input';
import { WindowService } from '@/services/WindowService';

export abstract class AuthServiceBase {
    abstract register(): Promise<void>;
    abstract unregister(): Promise<void>;

    constructor(
        private windowService: WindowService
    ) {}

    protected openAuthModal(controllerCreator: WindowControllerCreator<WindowType.INPUT_MODAL>) {
        const proxy = this.windowService.open(
            {
                type: WindowType.INPUT_MODAL,
                title: 'Authenticate',
                props: {
                    type: InputType.PASSWORD,
                    focused: true
                }
            },
            controllerCreator
        );

        return proxy;
    }
}
