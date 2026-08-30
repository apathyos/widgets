import { Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue, Reactive } from '../../../types/utils';
import { TRANSITION_NORMAL } from '../../../constants/widget';
import { Margin } from '../../../types/common';
import { toAccessor } from '@/utils/misc';
import { createComputed, With } from 'gnim';
import { useSetupControllers } from '@/hooks/use-setup-controllers';

export interface IRevealerBase {
    ref?: (self: Gtk.Revealer) => void;
    children: Children;
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

    const withTransition = createComputed(get => !(get(toAccessor(lazy)) && !get(toAccessor(transitionType))));

    const { onSetup } = useSetupControllers({ onMouseEnter, onMouseLeave });

    return (
        <box visible={visible}>
            <With value={withTransition}>
                {withTransition => withTransition ? (
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
                        {props.children}
                    </revealer>
                ) : props.children}
            </With>
        </box>
    );
}
