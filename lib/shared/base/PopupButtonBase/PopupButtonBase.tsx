import { createComputed, createState } from 'gnim';
import { Transition } from '../../../types/common';
import { PropertyValue } from '../../../types/utils';
import { Gtk } from 'ags/gtk4';
import { TransitionOptions } from '../../../types/widget';
import { toAccessor } from '../../../utils/misc';
import { ButtonBase, IButtonBase } from '../ButtonBase';
import { Floated } from '../../Floated';
import Pango from 'gi://Pango';
import { IFloated } from '../../Floated/Floated';
import { ISelectList, SelectList } from '@/shared';
import { isJSXElement } from '@/utils/typeguards';

export interface IPopupButtonBase<P = object> extends IButtonBase {
    values: ISelectList<P>['values'];
    isRootMounted: PropertyValue<boolean>;
    transitionDuration?: PropertyValue<Transition>;
    popupAlign?: IFloated['align'];
    popupPlacement?: IFloated['placement'];
    getItem: ISelectList<P>['getItem'];
    onToggle?: (isOpened: boolean) => void;
    onSelect?: ISelectList<P>['onSelect'];
}

export function PopupButtonBase<P>(props: IPopupButtonBase<P>) {
    const {
        values,
        onToggle,
        onSelect,
        transitionDuration = Transition.FAST,
        popupAlign,
        popupPlacement,
        getItem
    } = props;

    const [buttonRef, setButtonRef] = createState<Gtk.Box | null>(null);

    const transitionOptions = createComputed<TransitionOptions>(get => ({
        enabled: true,
        type: Gtk.RevealerTransitionType.CROSSFADE,
        duration: get(toAccessor(transitionDuration)),
    }));

    return (
        <box $={setButtonRef}>
            <Floated
                anchorRef={buttonRef}
                onOpen={({ shouldOpen }) => onToggle?.(shouldOpen)}
                isRootMounted={props.isRootMounted}
                transitionOptions={transitionOptions}
                withArrow
                align={popupAlign}
                placement={popupPlacement}
                floatContent={() => (
                    <SelectList
                        hexpand
                        values={values}
                        getItem={value => {
                            const item = getItem(value);

                            if (!item) {
                                return null;
                            }

                            if (isJSXElement(item)) {
                                return item;
                            }

                            return {
                                ...item,
                                ellipsize: item.ellipsize ?? Pango.EllipsizeMode.END,
                                maxWidthChar: item.maxWidthChar ?? 10
                            };
                        }}
                        onSelect={onSelect}
                    />
                )}
            >
                {({ toggleOpen }) => (
                    <ButtonBase
                        {...props}
                        onClick={toggleOpen}
                    />
                )}
            </Floated>
        </box>
    );
}
