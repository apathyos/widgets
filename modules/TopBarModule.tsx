import app from 'ags/gtk4/app';
import { createBinding, For } from 'gnim';
import { TopBar } from '../lib/components';
import { Astal } from 'ags/gtk4';

export function TopBarModule() {
    const monitors = createBinding(app, 'monitors');
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    return (
        <For
            each={monitors}
            //@ts-expect-error ignore
            cleanup={(window) => window.destroy()}
        >
            {(monitor) => (
                <window
                    visible
                    name="top-bar"
                    class="top-bar"
                    gdkmonitor={monitor}
                    exclusivity={Astal.Exclusivity.EXCLUSIVE}
                    anchor={TOP | LEFT | RIGHT}
                    application={app}
                >
                    <TopBar monitor={monitor} />
                </window>
            )}
        </For>
    );
}
