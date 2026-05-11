import { updateAccessor } from '../../utils/misc';
import { ISliderBase, SliderBase } from '../base/SliderBase';
import cn from 'classnames';

export interface ISlider extends ISliderBase {}

export function Slider(props: ISlider) {
    const { classes } = props;

    return (
        <SliderBase
            {...props}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'slider')),
            }}
        />
    );
}
