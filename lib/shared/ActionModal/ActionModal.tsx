import { Gtk } from 'ags/gtk4';
import { SPACING_L } from '../../constants/widget';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { isJSXElement } from '../../utils/typeguards';
import { IModal, Modal } from '../Modal';
import cn from 'classnames';
import { For } from 'gnim';
import { Button } from '../buttons';
import Pango from 'gi://Pango?version=1.0';
import { Action } from '../../types/common';

export interface IActionModal extends Omit<IModal, 'children'> {
    summary?: PropertyValue<string> | JSX.Element;
    actions?: PropertyValue<Action[]>;
    classes?: Classes<'title' | 'summary' | 'button' | 'close'> & IModal['classes'];
}

export function ActionModal(props: IActionModal) {
    const {
        summary,
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
                    <scrolledwindow vexpand hexpand>
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
                    </scrolledwindow>
                ) : null}

                <box class="action-modal-buttons" spacing={SPACING_L} halign={Gtk.Align.END} valign={Gtk.Align.END}>
                    <For each={toAccessor(actions)}>
                        {(action: Action) => (
                            <Button
                                onClick={async () => {
                                    try {
                                        await action.onAct();
                                    } catch {}
                                }}
                                classes={{
                                    root: updateAccessor(classes?.button, button => cn(button, 'action-modal__button'))
                                }}
                            >
                                <label label={action.name} halign={Gtk.Align.CENTER} hexpand />
                            </Button>
                        )}
                    </For>
                </box>
            </>
        </Modal>
    );
}
