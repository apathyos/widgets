import { createComputed, createState } from 'gnim';
import { Transition } from '../../../types/common';
import { PropertyValue } from '../../../types/utils';
import { IList, List } from '../../List';
import { Gtk } from 'ags/gtk4';
import { TransitionOptions } from '../../../types/widget';
import { toAccessor } from '../../../utils/misc';
import { ButtonBase, IButtonBase } from '../ButtonBase';
import { Floated } from '../../Floated';
import Pango from 'gi://Pango';
import { IFloated } from '../../Floated/Floated';

export interface IPopupButtonBase<P = object, V = string> extends IButtonBase {
    items: IList<P, V>['items'];
    isRootMounted: PropertyValue<boolean>;
    listItemHalign?: IList<P, V>['itemHalign'];
    listItemEllipsize?: IList<P, V>['ellipsize'];
    listItemMaxWidthChar?: IList<P, V>['maxWidthChar'];
    transitionDuration?: PropertyValue<Transition>;
    popupAlign?: IFloated['align'];
    popupPlacement?: IFloated['placement'];
    onToggle?: (isOpened: boolean) => void;
    onSelect?: IList<P, V>['onSelect'];
}

export function PopupButtonBase<P = object, V = string>(props: IPopupButtonBase<P, V>) {
    const {
        items,
        onToggle,
        onSelect,
        listItemHalign,
        listItemEllipsize = Pango.EllipsizeMode.END,
        listItemMaxWidthChar = 10,
        transitionDuration = Transition.FAST,
        popupAlign,
        popupPlacement,
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
                    <List
                        hexpand
                        items={items}
                        onSelect={onSelect}
                        itemHalign={listItemHalign}
                        ellipsize={listItemEllipsize}
                        maxWidthChar={listItemMaxWidthChar}
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
