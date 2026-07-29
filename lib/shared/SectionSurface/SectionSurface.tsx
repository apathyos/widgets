import { Gtk } from 'ags/gtk4';
import { Section, Surface } from '..';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface ISectionSurface {
    sections: JSX.Element[];
    classes?: Classes<'root'>;
}

export function SectionSurface(props: ISectionSurface) {
    const { sections, classes } = props;

    return (
        <Surface
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'section-window')),
            }}
        >
            <box orientation={Gtk.Orientation.VERTICAL}>
                {sections.map((section) => (
                    <Section hexpand>{section}</Section>
                ))}
            </box>
        </Surface>
    );
}
