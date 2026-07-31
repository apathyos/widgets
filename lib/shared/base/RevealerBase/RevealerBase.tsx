import { Gtk } from 'ags/gtk4';
import { Children, Classes, PropertyValue, Reactive } from '../../../types/utils';
import { TRANSITION_NORMAL } from '../../../constants/widget';
import { Margin } from '../../../types/common';

export interface IRevealerBase {
    ref?: (self: Gtk.Revealer) => void;
    children: Children;
    isRevealed: PropertyValue<boolean>;
    transitionType?: Gtk.RevealerTransitionType;
    transitionDuration?: number;
    margin?: Reactive<Margin>;
    heightRequest?: PropertyValue<number>;
    widthRequest?: PropertyValue<number>;
    css?: PropertyValue<string>;
    classes?: Classes<'root'>;
    onMouseEnter?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseLeave?: (args: { event: Gtk.EventControllerMotion }) => void;
}

export function RevealerBase(props: IRevealerBase) {
    const {
        ref,
        isRevealed,
        transitionType,
        transitionDuration = TRANSITION_NORMAL,
        margin,
        heightRequest,
        widthRequest,
        css,
        classes,
        onMouseEnter,
        onMouseLeave
    } = props;

    const mouseEnterController = new Gtk.EventControllerMotion();
    mouseEnterController.connect('enter', (event) => onMouseEnter?.({ event }));

    const mouseLeaveController = new Gtk.EventControllerMotion();
    mouseLeaveController.connect('leave', (event) => onMouseLeave?.({ event }));

    return (
        <revealer
            $={self => {
                self.add_controller(mouseEnterController);
                self.add_controller(mouseLeaveController);

                ref?.(self);
            }}
            class={classes?.root}
            revealChild={isRevealed}
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
    );
}
