import { useSetupControllers } from '@/hooks/use-setup-controllers';
import { Spacing } from '@/types/common';
import { Children, Classes, PropertyValue } from '@/types/utils';
import { MouseButton } from '@/types/widget';
import { toAccessor, unpackAccessor, updateAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';
import cn from 'classnames';
import { SymbolButton } from '../buttons';
import { With } from 'gnim';
import Pango from 'gi://Pango?version=1.0';

export interface IGroup {
    children?: Children;
    title?: PropertyValue<string>;
    isExpanded?: PropertyValue<boolean>;
    isClosable?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'expand' | 'title' | 'close'>;
    onExpand?: (isExpanded: boolean) => void;
    onHeaderClick?: () => void;
    onClose?: () => void;
}

export function Group(props: IGroup) {
    const { title, isExpanded, isClosable, classes, onExpand, onHeaderClick, onClose } = props;

    const { onSetup } = useSetupControllers({
        onClick: ({ event }) => {
            if (event.get_current_button() === MouseButton.LEFT) {
                onHeaderClick?.();
            }
        }
    });

    return (
        <box
            class={updateAccessor(
                classes?.root,
                (root, get) => cn(root, 'group', get(isExpanded) && 'group_expanded')
            )}
            orientation={Gtk.Orientation.VERTICAL}
            vexpand={false}
        >
            <box
                $={onSetup}
                class="group__header"
                spacing={Spacing.M}
                hexpand
            >
                <SymbolButton
                    onClick={() => onExpand?.(!unpackAccessor(isExpanded))}
                    classes={{
                        root: updateAccessor(
                            classes?.expand,
                            expand => cn(expand, 'group-button', 'group-button__expand')
                        )
                    }}
                >
                    <label label="󰁋" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
                </SymbolButton>

                <label
                    class={updateAccessor(classes?.title, title => cn(title, 'group__title'))}
                    label={title}
                    hexpand
                    halign={Gtk.Align.START}
                    maxWidthChars={45}
                    ellipsize={Pango.EllipsizeMode.END}
                />

                <With value={toAccessor(isClosable)}>
                    {isClosable => isClosable ? (
                        <box valign={Gtk.Align.START} halign={Gtk.Align.END}>
                            <SymbolButton
                                onClick={() => onClose?.()}
                                classes={{
                                    root: updateAccessor(
                                        classes?.close,
                                        (close) => cn(close, 'group-button', 'group-button__close')
                                    )
                                }}
                            >
                                <label label="󰅙" />
                            </SymbolButton>
                        </box>
                    ) : null}
                </With>
            </box>

            {props.children}
        </box>
    );
}
