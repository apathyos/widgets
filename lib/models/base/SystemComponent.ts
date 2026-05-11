import { Icon } from '../../types/icon';

export abstract class SystemComponent {
    abstract getIcon(...args: unknown[]): Icon;
}
