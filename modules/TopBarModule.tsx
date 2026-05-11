import app from 'ags/gtk4/app';
import css from '../style.scss';
import { createBinding, For } from 'gnim';
import { TopBar } from '../lib/components';
import { Astal } from 'ags/gtk4';
import { WindowId } from '../lib/types/window';

const main = () => {
    try {
        const monitors = createBinding(app, 'monitors');
        const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

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
        </For>;
    } catch {
        console.error(`${WindowId.TOP_BAR} has suddenly crashed! Restarting.`);
        main();
    }
};

app.start({
    css,
    instanceName: WindowId.TOP_BAR,
    requestHandler: () => {},
    main,
});
