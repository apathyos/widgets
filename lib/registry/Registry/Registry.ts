import { RegistryItem } from '../../types/registry';

export abstract class Registry<K, I extends RegistryItem<K>> {
    protected readonly items = new Map<K, I>();

    register(item: I) {
        if (this.items.has(item.id)) {
            return;
        }

        this.items.set(item.id, item);
    }

    unregister(id: K) {
        const item = this.items.get(id);
        this.items.delete(id);

        return item;
    }

    resolve(id: K) {
        return this.items.get(id);
    }
}
