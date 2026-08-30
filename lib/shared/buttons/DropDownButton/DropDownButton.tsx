import { createComputed, createState } from 'gnim';
import { Floated, ISelectList, ISelectListItem, SelectList, SymbolButton } from '../..';
import { Button, IButton } from '../..';
import { Gtk } from 'ags/gtk4';
import cn from 'classnames';
import { Classes, PropertyValue } from '../../../types/utils';
import { toAccessor, unpackAccessor, updateAccessor } from '../../../utils/misc';
import { IFloated } from '../../Floated/Floated';
import { Align, Offset, Placement, Transition } from '../../../types/common';
import { TransitionOptions } from '../../../types/widget';

export interface IDropDownButton<P = object> extends Omit<IButton, 'classes'> {
    values: ISelectList<P>['values'];
    listIcon?: {
        component?: JSX.Element;
    };
    isRootMounted?: PropertyValue<boolean>;
    listItemMaxWidthChar?: PropertyValue<number>;
    transitionDuration?: PropertyValue<Transition>;
    closeOnSelect?: PropertyValue<boolean>;
    classes?: Classes<'root' | 'iconButton'> & {
        buttonClasses?: IButton['classes'];
    };
    getItem: ISelectList<P>['getItem'];
    onToggle?: (isOpened: boolean) => void;
    onSelect?: ISelectListItem<P>['onSelect'];
}

export function DropDownButton<P = object>(props: IDropDownButton<P>) {
    const {
        values = [],
        listIcon,
        listItemMaxWidthChar,
        transitionDuration = Transition.NORMAL,
        closeOnSelect,
        classes,
        getItem,
        onToggle,
        onSelect,
    } = props;

    const [dropdownRef, setDropdownRef] = createState<Gtk.Box | null>(null);
    const [isOpened, setIsOpened] = createState(false);

    const transitionOptions = createComputed<TransitionOptions>(get => ({
        enabled: true,
        type: Gtk.RevealerTransitionType.SLIDE_DOWN,
        duration: get(toAccessor(transitionDuration)),
    }));

    const dropdownButtonClass = createComputed(
        (get) => cn('dropdown-button', get(isOpened) ? 'dropdown-button_opened' : ''),
    );

    const onOpen: IFloated['onOpen'] = (args) => {
        const { shouldOpen } = args;

        setIsOpened(shouldOpen);
        onToggle?.(shouldOpen);
    };

    return (
        <box class={dropdownButtonClass} $={setDropdownRef}>
            <Floated
                anchorRef={dropdownRef}
                anchorOffset={Offset.S}
                onOpen={onOpen}
                align={Align.START}
                placement={Placement.BOTTOM}
                isRootMounted={props.isRootMounted}
                transitionOptions={transitionOptions}
                floatContent={({ toggleOpen }) => (
                    <SelectList
                        values={values}
                        getItem={getItem}
                        onSelect={(...args) => {
                            onSelect?.(...args);
                            unpackAccessor(closeOnSelect) && toggleOpen();
                        }}
                        maxWidthChar={listItemMaxWidthChar}
                    />
                )}
            >
                {({ toggleOpen }) => (
                    <>
                        <Button
                            {...props}
                            classes={{
                                ...classes?.buttonClasses,
                                root: updateAccessor(
                                    classes?.buttonClasses?.root,
                                    (root) => cn(root, 'dropdown-button__base-button')
                                )
                            }}
                        />
                        <SymbolButton
                            onClick={toggleOpen}
                            classes={{ root: 'dropdown-button__icon-button' }}
                        >
                            {listIcon?.component || <label class="dropdown-button__icon-button-icon" label="" />}
                        </SymbolButton>
                    </>
                )}
            </Floated>
        </box>
    );
}
