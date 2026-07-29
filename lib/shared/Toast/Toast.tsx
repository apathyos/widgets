import { createComputed, createState, With } from 'gnim';
import { toAccessor, updateAccessor } from '../../utils/misc';
import { IModal, Modal } from '../Modal';
import cn from 'classnames';
import { Classes, PartialSome, PropertyValue } from '../../types/utils';
import { Gtk } from 'ags/gtk4';
import { isJSXElement } from '../../utils/typeguards';
import { SymbolButton } from '../buttons';
import { SPACING_M, SPACING_XL } from '../../constants/widget';
import Pango from 'gi://Pango?version=1.0';

export interface IToast extends Omit<PartialSome<IModal, 'children'>, 'orientation' | 'spacing' | 'classes'> {
    title?: PropertyValue<string> | JSX.Element;
    summary?: PropertyValue<string> | JSX.Element;
    body: PropertyValue<string> | JSX.Element;
    expandable?: PropertyValue<boolean>;
    closable?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'title' | 'summary' | 'body' | 'expandButton' | 'closeButton'>;
    onClose?: () => void;
}

export function Toast(props: IToast) {
    const { title, summary, body, expandable, closable, classes, onClose, ...restProps } = props;

    const [isExpanded, setIsExpanded] = createState(false);
    const showHeader = createComputed(get => !!get(toAccessor(title)));

    return (
        <Modal
            {...restProps}
            classes={{
                root: updateAccessor(classes?.root, (root, get) => cn(root, 'toast', get(isExpanded) && 'toast_expanded'))
            }}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={SPACING_XL}
        >
            <box hexpand spacing={showHeader(v => v ? SPACING_M : SPACING_XL)}>
                <With value={toAccessor(expandable)}>
                    {expandable => expandable ? (
                        <SymbolButton
                            onClick={() => setIsExpanded(!isExpanded.get())}
                            valign={Gtk.Align.START}
                            classes={{
                                root: updateAccessor(
                                    classes?.expandButton,
                                    expandButton => cn(expandButton, 'toast__button', 'toast__expand-button')
                                )
                            }}
                        >
                            <label label="󰁋" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
                        </SymbolButton>
                    ) : null}
                </With>

                <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING_XL}>
                    <With value={showHeader}>
                        {showHeader => showHeader ? (
                            <box
                                hexpand
                                spacing={SPACING_M}
                            >
                                {title ? (
                                    isJSXElement(title)
                                        ? title
                                        : (
                                            <label
                                                class={updateAccessor(classes?.title, title => cn(title, 'toast__title'))}
                                                label={title}
                                                halign={Gtk.Align.START}
                                            />
                                        )
                                ) : null}

                                {summary ? (
                                    isJSXElement(summary)
                                        ? summary
                                        : (
                                            <>
                                                <label label="•" />
                                                <label
                                                    class={
                                                        updateAccessor(
                                                            classes?.summary,
                                                            summary => cn(summary, 'toast__summary')
                                                        )}
                                                    label={summary}
                                                    halign={Gtk.Align.START}
                                                    hexpand
                                                />
                                            </>
                                        )
                                ) : null}
                            </box>
                        ) : null}
                    </With>

                    <scrolledwindow
                        vexpand
                        hexpand
                        vscrollbarPolicy={Gtk.PolicyType.NEVER}
                        class="toast-content-scroller"
                        propagateNaturalHeight={isExpanded}
                    >
                        {isJSXElement(body)
                            ? body
                            : (
                                <label
                                    class={updateAccessor(classes?.body, body => cn(body, 'toast__body'))}
                                    label={body}
                                    halign={Gtk.Align.FILL}
                                    valign={Gtk.Align.START}
                                    xalign={0}
                                    wrap
                                    wrapMode={Pango.WrapMode.CHAR}
                                    ellipsize={Pango.EllipsizeMode.END}
                                    lines={isExpanded(v => v ? 3 : 1)}
                                    hexpand
                                    vexpand
                                />
                            )
                        }
                    </scrolledwindow>
                </box>

                <With value={toAccessor(closable)}>
                    {closable => closable ? (
                        <box vexpand valign={Gtk.Align.START}>
                            <SymbolButton
                                onClick={onClose}
                                classes={{
                                    root: updateAccessor(
                                        classes?.closeButton,
                                        closeButton => cn(closeButton, 'toast__button', 'toast__close-button')
                                    )
                                }}
                            >
                                󰅙
                            </SymbolButton>
                        </box>
                    ) : null}
                </With>
            </box>

            {props.children}
        </Modal>
    );
}
