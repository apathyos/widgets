import { Gtk } from 'ags/gtk4';
import { Section, Window } from '..';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface ISectionWindow {
    sections: JSX.Element[];
    classes?: Classes<'root'>;
}

export function SectionWindow(props: ISectionWindow) {
    const { sections, classes } = props;

    return (
        <Window
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'section-window')),
            }}
        >
            <box orientation={Gtk.Orientation.VERTICAL}>
                {sections.map((section) => (
                    <Section hexpand>{section}</Section>
                ))}
            </box>
        </Window>
    );
}
