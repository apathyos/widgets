import { getLimitedLayoutHeight } from '@/utils/widget';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';
import GObject, { getter, register, setter } from 'gnim/gobject';

export interface IMaxLinesLabelBase extends Gtk.Label.ConstructorProps {
    maxLines?: number;
}

const MaxLinesProp = (name: string, flags: GObject.ParamFlags) => GObject.ParamSpec.int(
    name,
    '',
    '',
    flags,
    1,
    1_000_000_000,
    1
);

@register()
export class MaxLinesLabelBase extends Gtk.Label {
    private _maxLines = 1;

    private layoutSerial = 0;
    private heightCache = new Map<number, number>();

    constructor(props: Partial<IMaxLinesLabelBase> = {}) {
        const {
            maxLines = 1,
            ...rest
        } = props;

        super(rest);

        this._maxLines = maxLines;
    }

    @getter(MaxLinesProp)
    get maxLines(): number {
        return this._maxLines;
    }

    @setter(MaxLinesProp)
    set maxLines(value: number) {
        if (this._maxLines === value) {
            return;
        }

        this._maxLines = value;

        this.heightCache.clear();
        this.queue_resize();
        this.notify('max-lines');
    }

    vfunc_get_request_mode() {
        return Gtk.SizeRequestMode.HEIGHT_FOR_WIDTH;
    }

    vfunc_measure(orientation: Gtk.Orientation, forSize: number): [number, number, number, number] {
        if (orientation === Gtk.Orientation.HORIZONTAL) {
            const [minimum, natural] = super.vfunc_measure(Gtk.Orientation.HORIZONTAL, -1);

            return [minimum, natural, -1, -1];
        }

        if (!this.get_text() || this.maxLines <= 0) {
            return [0, 0, -1, -1];
        }

        if (forSize < 0) {
            const minimumHeight = this.measureLimitedHeight(-1);
            const [, naturalWidth] = super.vfunc_measure(Gtk.Orientation.HORIZONTAL, -1);
            const naturalHeight = this.measureLimitedHeight(naturalWidth);

            return [minimumHeight, Math.max(minimumHeight, naturalHeight), -1, -1];
        }

        const overallMinimum = this.measureLimitedHeight(-1);
        const contextualHeight = this.measureLimitedHeight(forSize);
        const height = Math.max(overallMinimum, contextualHeight);

        return [height, height, -1, -1];
    }

    private measureLimitedHeight(width: number): number {
        const source = this.get_layout();
        const serial = source.get_serial();

        if (serial !== this.layoutSerial) {
            this.layoutSerial = serial;
            this.heightCache.clear();
        }

        const cached = this.heightCache.get(width);

        if (cached !== undefined) {
            return cached;
        }

        const layout = this.get_layout().copy();

        layout.set_ellipsize(Pango.EllipsizeMode.NONE);
        layout.set_height(-1);
        layout.set_wrap(this.get_wrap_mode());
        layout.set_width(width >= 0 ? width * Pango.SCALE : -1);

        const height = getLimitedLayoutHeight({ layout, maxLines: this.maxLines });

        if (this.heightCache.size >= 8) {
            this.heightCache.clear();
        }

        this.heightCache.set(width, height);

        return height;
    }
}
