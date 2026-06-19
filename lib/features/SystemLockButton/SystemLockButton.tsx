import { Button, IButton } from '../../shared';
import { Classes } from '../../types/utils';
import cn from 'classnames';
import { updateAccessor } from '../../utils/misc';
import { Gtk } from 'ags/gtk4';
import { System } from '../../models/System';
import { sendRequest } from '../../rpc/utils';
import { SetStatusPanelIsOpenedCommandRequest } from '../../rpc/types/statusPanel';
import { RequestType } from '../../rpc/types';

export interface ISystemLockButton extends Pick<IButton, 'halign' | 'hexpand'> {
    classes?: Classes<'root'>;
}

export function SystemLockButton(props: ISystemLockButton) {
    const { classes, ...buttonProps } = props;

    const system = new System();

    const handleClick = async () => {
        await sendRequest<SetStatusPanelIsOpenedCommandRequest>({
            type: RequestType.COMMAND,
            statusPanel: { isOpened: false, instant: true },
        });

        system.lock();
    };

    return (
        <Button
            {...buttonProps}
            onClick={handleClick}
            classes={{
                root: updateAccessor(classes?.root, root => cn(root, 'system-lock-button'))
            }}
        >
            <label label="" hexpand halign={Gtk.Align.CENTER} />
        </Button>
    );
}
