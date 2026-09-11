import { Classes, PropertyValue } from '@/types/utils';
import { updateAccessor } from '@/utils/misc';
import cn from 'classnames';

export interface ISymbol {
    label: PropertyValue<string>;
    isVisible?: PropertyValue<boolean>;
    classes?: Classes<'root'>;
}

export function Symbol(props: ISymbol) {
    const { label, isVisible, classes } = props;

    return (
        <label
            class={updateAccessor(classes?.root, root => cn(root, 'symbol'))}
            label={label}
            visible={isVisible}
        />
    );
}
