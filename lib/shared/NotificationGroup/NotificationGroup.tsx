import cn from 'classnames';
import { Classes, PropertyValue } from '../../types/utils';
import { toAccessor, unpackAccessor, updateAccessor } from '../../utils/misc';
import { INotification } from '../../types/notification';
import { createComputed, createState, For, With } from 'gnim';
import { Notification } from '../Notification/Notification';
import { SPACING_M } from '../../constants/widget';
import { Gtk } from 'ags/gtk4';
import { SymbolButton } from '../buttons';
import Pango from 'gi://Pango?version=1.0';

export interface INotificationGroup {
    title: PropertyValue<string>;
    notifications: PropertyValue<INotification[]>;
    isExpanded?: PropertyValue<boolean>;
    closable?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'expand' | 'close' | 'appName' | 'notificationRoot'>;
    onExpand?: (isExpanded: boolean) => void;
}

export function NotificationGroup(props: INotificationGroup) {
    const { title, notifications, closable = true, classes, onExpand } = props;

    const [isExpanded, setIsExpanded] = createState(unpackAccessor(props.isExpanded) ?? false);
    const [minHeight, setMinHeight] = createState(0);

    toAccessor(props.isExpanded).subscribe(() => {
        const expanded = unpackAccessor(props.isExpanded);

        typeof expanded === 'boolean' && setIsExpanded(expanded);
    });

    const visibleNotifications = createComputed(get => {
        const notifs = get(toAccessor(notifications));

        if (notifs.length > 1 && get(isExpanded)) {
            return notifs;
        }

        return [notifs[0]];
    });

    return (
        <box
            class={updateAccessor(
                classes?.root,
                (root, get) => cn(root, 'notification-group', get(isExpanded) && 'notification-group_expanded')
            )}
            orientation={Gtk.Orientation.VERTICAL}
        >
            <box class="notification-group__header" spacing={SPACING_M} hexpand>
                <SymbolButton
                    onClick={() => {
                        const shouldExpand = !unpackAccessor(isExpanded);

                        setIsExpanded(shouldExpand);
                        onExpand?.(shouldExpand);

                        !shouldExpand && setMinHeight(0);
                    }}
                    classes={{
                        root: updateAccessor(
                            classes?.expand,
                            expand => cn(expand, 'notification-group__button', 'notification-group__expand')
                        )
                    }}
                >
                    <label label="󰁋" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
                </SymbolButton>

                <label
                    class={updateAccessor(classes?.appName, appName => cn(appName, 'notification-group__app-name'))}
                    label={title}
                    hexpand
                    halign={Gtk.Align.START}
                    maxWidthChars={45}
                    ellipsize={Pango.EllipsizeMode.END}
                />

                <With value={toAccessor(closable)}>
                    {closable => closable ? (
                        <box valign={Gtk.Align.START} halign={Gtk.Align.END}>
                            <SymbolButton
                                onClick={() => unpackAccessor(notifications).forEach(n => n.dismiss())}
                                classes={{
                                    root: updateAccessor(
                                        classes?.close,
                                        (close) => cn(close, 'notification-group__button', 'notification-group__close')
                                    )
                                }}
                            >
                                <label label="󰅙" />
                            </SymbolButton>
                        </box>
                    ) : null}
                </With>
            </box>

            <scrolledwindow
                $={self => {
                    self.vadjustment.connect('notify::upper', () => {
                        setMinHeight(Math.min(self.vadjustment.get_upper(), 500));
                    });
                }}
                hexpand
                class="notification-group-content-scroller"
                propagateNaturalHeight
                maxContentHeight={500}
                css={minHeight(minHeight => `min-height: ${minHeight}px;`)}
            >
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={SPACING_M}
                    vexpand={false}
                >
                    <For each={toAccessor(visibleNotifications)}>
                        {(notification: INotification) => (
                            <Notification
                                summary={notification.summary}
                                body={notification.body}
                                time={notification.time}
                                onClose={() => notification.dismiss()}
                                closable={isExpanded}
                                isExpanded={isExpanded}
                                classes={{
                                    root: updateAccessor(
                                        classes?.notificationRoot,
                                        notificationRoot => cn(notificationRoot, 'notification-group-notification')
                                    )
                                }}
                            />
                        )}
                    </For>
                </box>
            </scrolledwindow>
        </box>
    );
}
