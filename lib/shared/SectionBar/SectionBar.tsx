import { Bar, IBar } from '../../shared';

export interface ISectionBar extends Omit<IBar, 'children' | 'classes'> {
    left?: JSX.Element[];
    center?: JSX.Element[];
    right?: JSX.Element[];
    classes?: {
        barClasses?: IBar['classes'];
        root?: string;
        content?: string;
        left?: string;
        center?: string;
        right?: string;
    };
}

export function SectionBar(props: ISectionBar) {
    const { left, center, right, classes } = props;

    return (
        <Bar classes={classes?.barClasses}>
            <centerbox hexpand class={classes?.content}>
                <box class={classes?.left} $type="start">
                    {left}
                </box>
                <box class={classes?.center} $type="center">
                    {center}
                </box>
                <box class={classes?.right} $type="end">
                    {right}
                </box>
            </centerbox>
        </Bar>
    );
}
