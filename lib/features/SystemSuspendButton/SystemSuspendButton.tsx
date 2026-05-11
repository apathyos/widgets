import { Button, IButton } from '../../shared';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';
import { System } from '../../models/System';
import { sendRequest } from '../../rpc/utils';
import { SetStatusPanelIsOpenedCommandRequest } from '../../rpc/types/statusPanel';
import { WindowId } from '../../types/window';
import { RequestType } from '../../rpc/types';
import { LongClickProgressOverlay } from '../../shared/LongClickProgressOverlay';
import { Direction } from '../../types/common';

export interface ISystemSuspendButton extends Pick<IButton, 'halign' | 'hexpand'> {
    classes?: Classes<'root'>;
}

export function SystemSuspendButton(props: ISystemSuspendButton) {
    const { classes, ...buttonProps } = props;

    const system = new System();

    const handleClick = async () => {
        await sendRequest<SetStatusPanelIsOpenedCommandRequest>(WindowId.STATUS_PANEL, {
            type: RequestType.COMMAND,
            statusPanel: { isOpened: false, instant: true },
            shouldNotify: true
        });

        system.suspend();
    };

    return (
        <LongClickProgressOverlay
            direction={Direction.FORWARD}
            onDone={handleClick}
        >
            <Button
                {...buttonProps}
                classes={{
                    root: updateAccessor(classes?.root, root => cn(root, 'system-suspend-button'))
                }}
            >
                <label label="󰤄" hexpand halign={Gtk.Align.CENTER} />
            </Button>
        </LongClickProgressOverlay>
    );
}
