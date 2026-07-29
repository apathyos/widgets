import { For } from 'gnim';
import { FloatingWindow } from '../../widgets';
import { useWindowSystem } from '../../contexts/windowing';
import { Astal } from 'ags/gtk4';

export function FloatingLayer() {
    const { service } = useWindowSystem();

    return (
        <For
            each={service.registry.windows}
            id={(window) => window.id}
            cleanup={win => (win as Astal.Window).destroy?.()}
        >
            {window => (
                <FloatingWindow
                    window={window}
                />
            )}
        </For>
    );
}
