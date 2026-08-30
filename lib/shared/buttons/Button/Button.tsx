import { PropertyValue } from '@/types/utils';
import { updateAccessor } from '../../../utils/misc';
import { ButtonBase, IButtonBase } from '../../base/ButtonBase';
import cn from 'classnames';
import { DotsSpinner } from '@/shared/DotsSpinner';
import { Size } from '@/types/common';
import { Gtk } from 'ags/gtk4';
import { LoaderOverlay } from '@/shared/LoaderOverlay';

export interface IButton extends IButtonBase {
    isLoading?: PropertyValue<boolean>;
}

export function Button(props: IButton) {
    const { isLoading, classes } = props;

    return (
        <LoaderOverlay
            loader={(
                <box hexpand halign={Gtk.Align.CENTER}>
                    <DotsSpinner size={Size.S} />
                </box>
            )}
            isLoading={isLoading ?? false}
        >
            <ButtonBase
                {...props}
                classes={{
                    ...classes,
                    root: updateAccessor(classes?.root, (root, get) => cn(
                        root,
                        'button',
                        get(props.isInactive) && 'button_inactive',
                        get(props.isDisabled) && 'button_disabled'
                    )),
                }}
            />
        </LoaderOverlay>
    );
}
