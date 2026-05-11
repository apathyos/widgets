import { Direction } from '../types/common';

export const getGradientAxisFromDirection = (args: {
    direction: Direction;
}) => {
    const { direction } = args;

    switch (direction) {
        case Direction.FORWARD:
            return 'to right';
        case Direction.BACKWARD:
            return 'to left';
        case Direction.DOWNWARD:
            return 'to bottom';
        default:
            return 'to top';
    }
};
