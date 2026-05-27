import app from 'ags/gtk4/app';
import { execAsync } from 'ags/process';
import cn from 'classnames';
import { SymbolButton } from '../../shared';
import { createState, onCleanup } from 'gnim';
import { KeyboardLayout } from '../../types/input';
import { IpcSocket } from '../../models/IpcSocket';
import { handleEvent } from '../../ipc/utils';
import { getIsKeyboardLayoutChangedIpcEvent } from '../../ipc';
import { handleRequest } from '../../rpc/utils';
import { getIsKeyboardLayoutCommandRequest } from '../../rpc';

export interface IKeyboardButton {
    classes?: {
        root?: string;
        label?: string;
    };
}

const ipcSocket = new IpcSocket();

export function KeyboardButton(props: IKeyboardButton) {
    const { classes } = props;

    const [layout, setLayout] = createState(KeyboardLayout.US);

    app.connect('request', handleRequest(getIsKeyboardLayoutCommandRequest, async ({ input }) => {
        setLayout(input.keyboard.layout);
    }));

    const kbLayoutListenerDispose = ipcSocket.listen(handleEvent(getIsKeyboardLayoutChangedIpcEvent, (payload) => {
        setLayout(payload.layout_short);
    }));

    onCleanup(() => {
        kbLayoutListenerDispose();
    });

    return (
        <SymbolButton
            classes={{ root: cn(classes?.root, 'keyboard-button') }}
            onClick={() => execAsync(['sh', '-c', 'EWW=1 $_APTH_BIN/system/input/switch_kb_layout'])}
        >
            <label class={cn(classes?.label, 'keyboard-button__label')} label={layout} />
        </SymbolButton>
    );
}
