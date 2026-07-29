import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { isJSXElement } from '../../utils/typeguards';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { SymbolButton } from '../buttons';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';
import { createComputed, createState, With } from 'gnim';
import { getRelativeDate } from '../../utils/time';
import { Surface } from '../Surface';
import { Spacing } from '../../types/common';

export interface INotification {
    ref?: (self: Gtk.Box) => void;
    title?: PropertyValue<string | undefined> | JSX.Element;
    summary?: PropertyValue<string | undefined> | JSX.Element;
    body?: PropertyValue<string | undefined> | JSX.Element;
    time?: PropertyValue<number>;
    expandable?: PropertyValue<boolean>;
    isExpanded?: PropertyValue<boolean>;
    closable?: PropertyValue<boolean>;
    minContentLines?: PropertyValue<number>;
    maxContentLines?: PropertyValue<number>;
    maxTitleWidthChars?: PropertyValue<number>;
    maxSummaryWidthChars?: PropertyValue<number>;
    maxBodyWidthChars?: PropertyValue<number>;
    classes?: Classes<'root' | 'title' | 'summary' | 'body' | 'expand' | 'close'>;
    onClose?: () => void;
}

export function Notification(props: INotification) {
    const {
        ref,
        title,
        summary,
        body,
        expandable = false,
        closable = true,
        minContentLines = 2,
        maxContentLines = 5,
        maxTitleWidthChars = 25,
        maxSummaryWidthChars = 15,
        maxBodyWidthChars = 60,
        classes,
        onClose
    } = props;

    const [time, setTime] = createState('');
    const [isExpanded, setIsExpanded] = createState(unpackAccessor(props.isExpanded) ?? false);

    const hasTitle = createComputed(get => !!(isJSXElement(title) || get(toAccessor(title))));
    const hasSummary = createComputed(get => !!(isJSXElement(summary) || get(toAccessor(summary))));
    const hasBody = createComputed(get => !!(isJSXElement(body) || get(toAccessor(body))));
    const showDelimiter = createComputed(get => get(hasTitle) && get(hasSummary));

    const contentLines = createComputed(get => {
        if (isJSXElement(body)) {
            return [];
        }

        const expanded = get(isExpanded);
        const maxLines = get(toAccessor(maxContentLines));
        const minLines = get(toAccessor(minContentLines));
        let isReduced = false;

        return get(toAccessor(body))?.trim().split('\n').reduce((acc, line, idx) => {
            if (isReduced) {
                return acc;
            }

            const isLast = expanded ? idx === maxLines - 1 : idx === minLines - 1;

            if (!isLast || line.trim()) {
                acc.push(line);
            }

            if (isLast) {
                isReduced = true;
            }

            return acc;
        }, [] as string[]) ?? [];
    });

    if (props.time !== undefined) {
        setTime(getRelativeDate((unpackAccessor(props.time) ?? 0) * 1000));
    }

    toAccessor(props.isExpanded).subscribe(() => {
        const expanded = unpackAccessor(props.isExpanded);

        typeof expanded === 'boolean' && setIsExpanded(expanded);
    });

    return (
        <Surface
            ref={ref}
            classes={{
                root: updateAccessor(
                    classes?.root,
                    (root, get) => cn(root, 'notification', get(isExpanded) && 'notification_expanded')
                )
            }}
            hexpand
            vexpand
            spacing={Spacing.M}
        >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={Spacing.L}>
                <box
                    spacing={Spacing.M}
                    hexpand
                >
                    <With value={toAccessor(expandable)}>
                        {expandable => expandable ? (
                            <SymbolButton
                                onClick={() => setIsExpanded(!unpackAccessor(isExpanded))}
                                classes={{
                                    root: updateAccessor(
                                        classes?.expand,
                                        expand => cn(expand, 'notification__button', 'notification__expand')
                                    )
                                }}
                            >
                                <label label="󰁋" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
                            </SymbolButton>
                        ) : null}
                    </With>

                    <With value={hasTitle}>
                        {hasTitle => hasTitle ? (
                            <box class={updateAccessor(classes?.title, (title) => cn(title, 'notification__title'))}>
                                {isJSXElement(title)
                                    ? title
                                    : <label
                                            class="notification__title-label"
                                            label={toAccessor(title)(v => v?.trim() ?? '')}
                                            maxWidthChars={maxTitleWidthChars}
                                            ellipsize={Pango.EllipsizeMode.END}
                                        />
                                }
                            </box>
                        ) : null}
                    </With>

                    <With value={showDelimiter}>
                        {showDelimiter => showDelimiter ? <label label="•" valign={Gtk.Align.CENTER} /> : null}
                    </With>

                    <With value={hasSummary}>
                        {hasSummary => hasSummary ? (
                            <box
                                class={updateAccessor(
                                    classes?.summary,
                                    (summary) => cn(summary, 'notification__summary')
                                )}
                            >
                                {isJSXElement(summary)
                                    ? summary
                                    : (
                                        <label
                                            class="notification__summary-label"
                                            maxWidthChars={maxSummaryWidthChars}
                                            ellipsize={Pango.EllipsizeMode.END}
                                            label={toAccessor(summary)(v => v?.trim() ?? '')}
                                        />
                                    )
                                }
                            </box>
                        ) : null}
                    </With>

                    <With value={time}>
                        {time => time && (title || summary) ? <label label="•" valign={Gtk.Align.CENTER} /> : null}
                    </With>

                    {time && (
                        <label label={time} />
                    )}
                </box>

                <With value={hasBody}>
                    {hasBody => hasBody ? (
                        <box class={updateAccessor(classes?.body, (body) => cn(body, 'notification__body'))}>
                            {isJSXElement(body)
                                ? body
                                : (
                                    <label
                                        class="notification__body-label"
                                        label={createComputed(get => get(contentLines).join('\n'))}
                                        wrap
                                        wrapMode={Pango.WrapMode.WORD_CHAR}
                                        halign={Gtk.Align.START}
                                        valign={Gtk.Align.START}
                                        xalign={0}
                                        useMarkup
                                        hexpand
                                        ellipsize={Pango.EllipsizeMode.END}
                                        lines={createComputed(get => Math.min(
                                            get(isExpanded)
                                                ? get(toAccessor(maxContentLines))
                                                : get(toAccessor(minContentLines)),
                                                get(contentLines).length + 1
                                        ))}
                                        maxWidthChars={maxBodyWidthChars}
                                    />
                                )
                            }
                        </box>
                    ) : null}
                </With>
            </box>

            <With value={toAccessor(closable)}>
                {closable => closable ? (
                    <box valign={Gtk.Align.START} halign={Gtk.Align.END}>
                        <SymbolButton
                            onClick={() => onClose?.()}
                            classes={{
                                root: updateAccessor(
                                    classes?.close,
                                    (close) => cn(close, 'notification__button', 'notification__close')
                                )
                            }}
                        >
                            <label label="󰅙" />
                        </SymbolButton>
                    </box>
                ) : null}
            </With>
        </Surface>
    );
}
