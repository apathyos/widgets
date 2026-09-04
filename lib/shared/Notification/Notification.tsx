import { Classes, PropertyValue } from '../../types/utils';
import cn from 'classnames';
import { isJSXElement } from '../../utils/typeguards';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { SymbolButton } from '../buttons';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';
import { createComputed, createState, onCleanup, With } from 'gnim';
import { getRelativeDate } from '../../utils/time';
import { Surface } from '../Surface';
import { Spacing } from '../../types/common';
import { ExpandableLabel } from '../ExpandableLabel';

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
    bodyTooltipText?: PropertyValue<string>;
    expandingTransitionType?: PropertyValue<Gtk.StackTransitionType>;
    expandingTransitionDuration?: PropertyValue<number>;
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
        bodyTooltipText,
        expandingTransitionType,
        expandingTransitionDuration,
        classes,
        onClose
    } = props;

    const [time, setTime] = createState('');
    const [isExpanded, setIsExpanded] = createState(unpackAccessor(props.isExpanded) ?? false);

    const hasTitle = createComputed(get => !!(isJSXElement(title) || get(toAccessor(title))));
    const hasSummary = createComputed(get => !!(isJSXElement(summary) || get(toAccessor(summary))));
    const hasBody = createComputed(get => !!(isJSXElement(body) || get(toAccessor(body))));
    const showDelimiter = createComputed(get => get(hasTitle) && get(hasSummary));

    if (props.time !== undefined) {
        setTime(getRelativeDate((unpackAccessor(props.time) ?? 0) * 1000));
    }

    const isExpandedSub = toAccessor(props.isExpanded).subscribe(() => {
        const expanded = unpackAccessor(props.isExpanded);

        typeof expanded === 'boolean' && setIsExpanded(expanded);
    });

    onCleanup(() => {
        isExpandedSub();
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
                                    <ExpandableLabel
                                        label={toAccessor(body)(v => v?.trimEnd() ?? '')}
                                        tooltipText={bodyTooltipText}
                                        isExpanded={isExpanded}
                                        minContentLines={minContentLines}
                                        maxContentLines={maxContentLines}
                                        maxWidthChars={maxBodyWidthChars}
                                        transitionType={expandingTransitionType}
                                        transitionDuration={expandingTransitionDuration}
                                        useMarkup
                                        classes={{ label: 'notification__body-label' }}
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
