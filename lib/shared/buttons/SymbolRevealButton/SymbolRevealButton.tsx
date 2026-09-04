import { createState } from 'gnim';
import { ISymbolButton, SymbolButton } from '..';
import { Classes, PropertyValue } from '../../../types/utils';
import { Gtk } from 'ags/gtk4';
import { updateAccessor } from '../../../utils/misc';
import cn from 'classnames';
import { Revealer } from '../..';
import Pango from 'gi://Pango?version=1.0';

export interface ISymbolRevealButton extends ISymbolButton {
    label?: PropertyValue<string>;
    spacing?: PropertyValue<number>;
    transitionType?: Gtk.RevealerTransitionType;
    transitionDuration?: number;
    classes?: Classes<'root' | 'contentContainer' | 'label'>;
}

export function SymbolRevealButton(props: ISymbolRevealButton) {
    const {
        label,
        spacing = 5,
        transitionType = Gtk.RevealerTransitionType.SLIDE_LEFT,
        transitionDuration,
        classes,
    } = props;

    const [isRevealed, setIsRevealed] = createState(false);

    return (
        <SymbolButton
            {...props}
            onHover={(args) => {
                setIsRevealed(args.isHovered);
                props.onHover?.(args);
            }}
        >
            <box spacing={spacing}>
                {props.children}

                <Revealer
                    isRevealed={isRevealed}
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                >
                    {() => (
                        <box
                            class={updateAccessor(
                                classes?.contentContainer,
                                (contentContainer) => cn(contentContainer, 'symbol-reveal-button__content-container')
                            )}
                            orientation={Gtk.Orientation.VERTICAL}
                            valign={Gtk.Align.CENTER}
                        >
                            <label
                                class={updateAccessor(classes?.label, (label) => cn(label, 'symbol-reveal-button__label'))}
                                label={label}
                                maxWidthChars={15}
                                ellipsize={Pango.EllipsizeMode.END}
                            />
                        </box>
                    )}
                </Revealer>
            </box>
        </SymbolButton>
    );
}
