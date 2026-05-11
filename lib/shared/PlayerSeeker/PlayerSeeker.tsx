import { Classes, PropertyValue } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import { ISlider, Slider } from '../Slider';
import cn from 'classnames';

export interface IPlayerSeeker {
    min: PropertyValue<number>;
    max: PropertyValue<number>;
    value: PropertyValue<number>;
    classes?: Classes<'root'>;
    onChange?: ISlider['onChange'];
}

export function PlayerSeeker(props: IPlayerSeeker) {
    const { min, max, value, classes, onChange } = props;

    return (
        <Slider
            classes={{ root: updateAccessor(classes?.root, (root) => cn(root, 'player-seeker')) }}
            min={min}
            max={max}
            value={value}
            hexpand
            onChange={onChange}
        />
    );
}
