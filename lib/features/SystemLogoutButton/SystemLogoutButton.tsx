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
import { Direction } from '../../types/common';
import { LongClickProgressOverlay } from '../../shared/LongClickProgressOverlay';

export interface ISystemLogoutButton extends Pick<IButton, 'halign' | 'hexpand'> {
    classes?: Classes<'root'>;
}

export function SystemLogoutButton(props: ISystemLogoutButton) {
    const { classes, ...buttonProps } = props;

    const system = new System();

    const handleClick = async () => {
        await sendRequest<SetStatusPanelIsOpenedCommandRequest>(WindowId.STATUS_PANEL, {
            type: RequestType.COMMAND,
            statusPanel: { isOpened: false, instant: true },
            shouldNotify: true
        });

        system.logout();
    };

    return (
        <LongClickProgressOverlay
            direction={Direction.FORWARD}
            onDone={handleClick}
        >
            <Button
                {...buttonProps}
                classes={{
                    root: updateAccessor(classes?.root, root => cn(root, 'system-logout-button'))
                }}
            >
                <label label="󰍃" hexpand halign={Gtk.Align.CENTER} />
            </Button>
        </LongClickProgressOverlay>
    );
}
