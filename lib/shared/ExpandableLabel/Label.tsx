import { Classes, PropertyValue } from '@/types/utils';
import { toAccessor } from '@/utils/misc';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';
import { createComputed, With } from 'gnim';
import { MaxLinesLabelBase } from '../base/MaxLinesLabelBase';

export interface ILabel {
    ref?: (self: Gtk.Label) => void;
    name?: PropertyValue<string>;
    label: PropertyValue<string>;
    tooltipText?: PropertyValue<string>;
    maxWidthChars?: PropertyValue<number>;
    wrap?: PropertyValue<boolean>;
    wrapMode?: PropertyValue<Pango.WrapMode>;
    ellipsize?: PropertyValue<Pango.EllipsizeMode>;
    lines?: PropertyValue<number>;
    maxLines?: PropertyValue<number>;
    useMarkup?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function Label(props: ILabel) {
    const {
        ref,
        name,
        label,
        tooltipText,
        maxWidthChars,
        wrap = true,
        wrapMode = Pango.WrapMode.WORD_CHAR,
        ellipsize,
        lines = -1,
        maxLines,
        useMarkup,
        classes
    } = props;

    return (
        <box $type="named" name={name}>
            <With value={toAccessor(maxLines)}>
                {(maxLines: number | undefined) => maxLines !== undefined ? (
                    <MaxLinesLabelBase
                        $={ref}
                        class={classes?.root}
                        label={label}
                        wrap={wrap}
                        wrapMode={wrapMode}
                        lines={-1}
                        maxLines={maxLines}
                        ellipsize={Pango.EllipsizeMode.NONE}
                        maxWidthChars={maxWidthChars}
                        xalign={0}
                        yalign={0}
                        hexpand
                        halign={Gtk.Align.FILL}
                        useMarkup={useMarkup}
                    />
                ) : (
                    <label
                        $={ref}
                        class={classes?.root}
                        label={label}
                        tooltipText={
                            createComputed(get => get(toAccessor(useMarkup)) ? '' : get(toAccessor(tooltipText)) ?? '')
                        }
                        tooltipMarkup={
                            createComputed(get => get(toAccessor(useMarkup)) ? get(toAccessor(tooltipText)) ?? '' : '')
                        }
                        wrap={wrap}
                        wrapMode={wrapMode}
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.START}
                        xalign={0}
                        yalign={0}
                        hexpand
                        vexpand={false}
                        ellipsize={ellipsize}
                        maxWidthChars={maxWidthChars}
                        lines={lines}
                        useMarkup={useMarkup}
                    />
                )}
            </With>
        </box>
    );
}
