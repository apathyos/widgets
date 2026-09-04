import { unpackAccessor } from '@/utils/misc';
import { Stacked } from '../Stacked';
import { Classes, PropertyValue } from '@/types/utils';
import { Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango?version=1.0';
import { ExpandableLabelPage } from './types';
import { Label } from './Label';
import { createEffect } from 'gnim';

export interface IExpandableLabel {
    label: PropertyValue<string>;
    tooltipText?: PropertyValue<string>;
    isExpanded: PropertyValue<boolean>;
    maxWidthChars?: PropertyValue<number>;
    minContentLines?: PropertyValue<number>;
    maxContentLines?: PropertyValue<number>;
    transitionType?: PropertyValue<Gtk.StackTransitionType>;
    transitionDuration?: PropertyValue<number>;
    useMarkup?: PropertyValue<boolean>;
    classes?: Classes<'label'>;
}

export function ExpandableLabel(props: IExpandableLabel) {
    const {
        label,
        tooltipText,
        isExpanded,
        maxWidthChars,
        minContentLines = 2,
        maxContentLines = 5,
        transitionType,
        transitionDuration,
        useMarkup,
        classes,
    } = props;

    let stackRef: Gtk.Stack | null = null;
    let visibleLabelRef: Gtk.Label | null = null;

    let isInitialized = false;

    const isInitialExpanded = unpackAccessor(isExpanded);

    function applyStableState(isExpanded: boolean) {
        if (!visibleLabelRef) {
            return;
        }

        visibleLabelRef.ellipsize = Pango.EllipsizeMode.END;
        visibleLabelRef.lines = isExpanded ? unpackAccessor(maxContentLines) : unpackAccessor(minContentLines);
    }

    function beginTransition(isExpanded: boolean) {
        if (!stackRef || !visibleLabelRef) {
            return;
        }

        visibleLabelRef.ellipsize = Pango.EllipsizeMode.NONE;
        visibleLabelRef.lines = -1;
        stackRef.visibleChildName = isExpanded ? ExpandableLabelPage.EXPANDED : ExpandableLabelPage.COLLAPSED;
    }

    createEffect(() => {
        const expanded = unpackAccessor(isExpanded, true);

        if (!stackRef || !visibleLabelRef) {
            return;
        }

        if (!isInitialized) {
            isInitialized = true;
            stackRef.visibleChildName = expanded ? ExpandableLabelPage.EXPANDED : ExpandableLabelPage.COLLAPSED;

            applyStableState(expanded);
            return;
        }

        beginTransition(expanded);
    });

    return (
        <Stacked
            visiblePage={
                unpackAccessor(isExpanded)
                    ? ExpandableLabelPage.EXPANDED
                    : ExpandableLabelPage.COLLAPSED
            }
            overlay={{
                hexpand: true,
                vexpand: false,
                halign: Gtk.Align.FILL,
                valign: Gtk.Align.START
            }}
            stack={{
                ref: self => (stackRef = self),
                isHidden: true,
                vhomogeneous: false,
                hhomogeneous: true,
                canTarget: false,
                hexpand: true,
                vexpand: false,
                halign: Gtk.Align.FILL,
                valign: Gtk.Align.START,
                transitionType,
                transitionDuration,
                onNotifyTransitionRunning: self => {
                    if (!self.transitionRunning) {
                        applyStableState(self.visibleChildName === ExpandableLabelPage.EXPANDED);
                    }
                }
            }}
            stackChildren={(
                <>
                    <Label
                        name={ExpandableLabelPage.COLLAPSED}
                        label={label}
                        maxLines={minContentLines}
                        maxWidthChars={maxWidthChars}
                        useMarkup={useMarkup}
                        classes={{ root: classes?.label }}
                    />

                    <Label
                        name={ExpandableLabelPage.EXPANDED}
                        label={label}
                        maxLines={maxContentLines}
                        maxWidthChars={maxWidthChars}
                        useMarkup={useMarkup}
                        classes={{ root: classes?.label }}
                    />
                </>
            )}
        >
            <Label
                ref={(self) => (visibleLabelRef = self)}
                label={label}
                tooltipText={tooltipText}
                ellipsize={Pango.EllipsizeMode.END}
                lines={isInitialExpanded ? unpackAccessor(maxContentLines) : unpackAccessor(minContentLines)}
                maxWidthChars={maxWidthChars}
                useMarkup={useMarkup}
                classes={{ root: classes?.label }}
            />
        </Stacked>
    );
}
