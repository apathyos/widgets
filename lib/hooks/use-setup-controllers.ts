import { Gtk } from 'ags/gtk4';
import { Element } from '../types/widget';
import { onCleanup } from 'gnim';

export const useSetupControllers = (args: {
    onClick?: (args: { event: Gtk.GestureClick }) => void;
    onMouseMove?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseEnter?: (args: { event: Gtk.EventControllerMotion }) => void;
    onMouseLeave?: (args: { event: Gtk.EventControllerMotion }) => void;
    onKeyDown?: (args: { event: Gtk.EventControllerKey }) => void;
}) => {
    const { onClick, onMouseMove, onMouseEnter, onMouseLeave, onKeyDown } = args;

    const clickController = new Gtk.GestureClick();
    const clickSub = clickController.connect('pressed', (event) => onClick?.({ event }));

    const moveController = new Gtk.EventControllerMotion();
    const moveSub = moveController.connect('motion', (event) => onMouseMove?.({ event }));

    const mouseEnterController = new Gtk.EventControllerMotion();
    const mouseEnterSub = mouseEnterController.connect('enter', (event) => onMouseEnter?.({ event }));

    const mouseLeaveController = new Gtk.EventControllerMotion();
    const mouseLeaveSub = mouseLeaveController.connect('leave', (event) => onMouseLeave?.({ event }));

    const keyController = new Gtk.EventControllerKey();
    const keySub = keyController.connect('key-pressed', (event) => onKeyDown?.({ event }));

    const onSetup = (ref: Element) => {
        onClick && ref.add_controller(clickController);
        onMouseMove && ref.add_controller(moveController);
        onMouseEnter && ref.add_controller(mouseEnterController);
        onMouseLeave && ref.add_controller(mouseLeaveController);
        onKeyDown && ref.add_controller(keyController);
    };

    onCleanup(() => {
        clickController.disconnect(clickSub);
        moveController.disconnect(moveSub);
        mouseEnterController.disconnect(mouseEnterSub);
        mouseLeaveController.disconnect(mouseLeaveSub);
        keyController.disconnect(keySub);
    });

    return { onSetup };
};
