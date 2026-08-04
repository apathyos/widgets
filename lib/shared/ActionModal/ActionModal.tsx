import { Gtk } from 'ags/gtk4';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { isJSXElement } from '../../utils/typeguards';
import { IModal, Modal } from '../Modal';
import cn from 'classnames';
import { For } from 'gnim';
import Pango from 'gi://Pango?version=1.0';
import { ActionModalAction } from './components';
import { ActionModalAction as ActionModalActionType } from './types';
import { Spacing } from '@/types/common';

export interface IActionModal extends Omit<IModal, 'children'> {
    summary?: PropertyValue<string> | JSX.Element;
    summaryNaturalHeight?: PropertyValue<boolean>;
    actions?: PropertyValue<ActionModalActionType[]>;
    classes?: Classes<'title' | 'summary' | 'button' | 'close'> & IModal['classes'];
}

export function ActionModal(props: IActionModal) {
    const {
        summary,
        summaryNaturalHeight,
        actions = [],
        classes,
    } = props;

    return (
        <Modal
            {...props}
            classes={{
                ...classes,
                root: updateAccessor(classes?.root, root => cn(root, 'action-modal'))
            }}
        >
            <>
                {summary ? (
                    <Gtk.ScrolledWindow vexpand hexpand propagateNaturalHeight={summaryNaturalHeight}>
                        {isJSXElement(summary)
                            ? summary
                            : (
                                <label
                                    class={updateAccessor(classes?.summary, summary => cn(summary, 'action-modal__summary'))}
                                    label={summary}
                                    halign={Gtk.Align.FILL}
                                    xalign={0}
                                    wrap
                                    wrapMode={Pango.WrapMode.WORD_CHAR}
                                    naturalWrapMode={Gtk.NaturalWrapMode.WORD}
                                />
                            )
                        }
                    </Gtk.ScrolledWindow>
                ) : null}

                <box class="action-modal-buttons" spacing={Spacing.L} halign={Gtk.Align.END} valign={Gtk.Align.END}>
                    <For each={toAccessor(actions)}>
                        {(action: ActionModalActionType) => <ActionModalAction action={action} classes={classes} />}
                    </For>
                </box>
            </>
        </Modal>
    );
}
