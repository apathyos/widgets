import { updateAccessor } from '@/utils/misc';
import { Button } from '../../buttons';
import { Classes } from '@/types/utils';
import cn from 'classnames';
import { Gtk } from 'ags/gtk4';
import { ActionModalAction } from '../types';

export interface IActionModalAction {
    action: ActionModalAction;
    classes?: Classes<'button'>;
}

export function ActionModalAction(props: IActionModalAction) {
    const { action, classes } = props;

    return (
        <Button
            isLoading={updateAccessor(action.payload?.isLoading, (isLoading = false) => isLoading)}
            isDisabled={action.payload?.isDisabled}
            onClick={() => action.onAct()}
            classes={{
                root: updateAccessor(classes?.button, button => cn(button, 'action-modal__button'))
            }}
        >
            <label label={action.name} halign={Gtk.Align.CENTER} hexpand />
        </Button>
    );
}
