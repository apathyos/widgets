import { WindowProxy } from '../../models/types/windowing';
import { Window } from '../../models/Window';
import { WindowType } from '../../types/windowing';

export interface IWindowFactoryComponentWrapper<T extends WindowType> {
    window: Window<T>;
    proxy: WindowProxy<T>;
}
