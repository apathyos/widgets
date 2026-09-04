import { Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue, Reactive } from '../../../types/utils';
import { TRANSITION_NORMAL } from '../../../constants/widget';
import { Margin } from '../../../types/common';
import { toAccessor, unpackAccessor } from '@/utils/misc';
import { createEffect, createState, onCleanup, With } from 'gnim';
import { useSetupControllers } from '@/hooks/use-setup-controllers';
import { timeout, Timer } from 'ags/time';

export interface IRevealerBase {
    ref?: (self: Gtk.Revealer) => void;
    children: () => Children;
    visible?: PropertyValue<boolean>;
    isRevealed: PropertyValue<boolean | undefined>;
    transitionType?: PropertyValue<Gtk.RevealerTransitionType>;
    transitionDuration?: PropertyValue<number>;
    margin?: Reactive<Margin>;
    heightRequest?: PropertyValue<number>;
    widthRequest?: PropertyValue<number>;
    lazy?: PropertyValue<boolean>;
    vexpand?: PropertyValue<boolean>;
    hexpand?: PropertyValue<boolean>;
    css?: PropertyValue<string>;
    classes?: Classes<'root'>;
    onMouseEnter?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseLeave?: (args: { event: Gtk.EventControllerMotion }) => void;
}

export function RevealerBase(props: IRevealerBase) {
    const {
        ref,
        visible,
        isRevealed,
        transitionType,
        transitionDuration = TRANSITION_NORMAL,
        margin,
        heightRequest,
        widthRequest,
        lazy,
        css,
        classes,
        onMouseEnter,
        onMouseLeave
    } = props;

    const [shouldRender, setShouldRender] = createState(unpackAccessor(lazy) ? unpackAccessor(isRevealed) : true);

    let timerRef: Timer | null = null;

    const { onSetup } = useSetupControllers({ onMouseEnter, onMouseLeave });

    createEffect(() => {
        timerRef?.cancel();

        const revealed = unpackAccessor(isRevealed, true);

        if (revealed) {
            setShouldRender(true);
        } else {
            timerRef = timeout(unpackAccessor(transitionDuration), () => setShouldRender(false));
        }
    });

    onCleanup(() => timerRef?.cancel());

    return (
        <box visible={visible}>
            <revealer
                $={self => {
                    onSetup(self);
                    ref?.(self);
                }}
                class={classes?.root}
                visible={visible}
                revealChild={toAccessor(isRevealed)(v => v ?? true)}
                transitionType={transitionType}
                transitionDuration={transitionDuration}
                marginTop={margin?.top}
                marginStart={margin?.left}
                marginEnd={margin?.right}
                marginBottom={margin?.bottom}
                heightRequest={heightRequest}
                widthRequest={widthRequest}
                css={css}
            >
                <With value={shouldRender}>
                    {shouldRender => shouldRender && props.children()}
                </With>
            </revealer>
        </box>
    );
}
