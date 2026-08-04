import { Children, PropertyValue } from '@/types/utils';
import { toAccessor, updateAccessor } from '@/utils/misc';
import cn from 'classnames';

export interface ILoaderOverlay {
    children: Children;
    loader: Children;
    isLoading: PropertyValue<boolean>;
    isInteractive?: PropertyValue<boolean>;
    shouldHideContent?: PropertyValue<boolean>;
}

export function LoaderOverlay(props: ILoaderOverlay) {
    const {
        children,
        loader,
        isLoading,
        isInteractive = false,
        shouldHideContent = true,
    } = props;

    return (
        <overlay
            class={updateAccessor(isLoading, (isLoading, get) => cn(
                'loader-overlay',
                isLoading && get(shouldHideContent) && 'loader-overlay_hidden-content'
            ))}
        >
            {children}

            <box
                $type="overlay"
                class='loader-overlay__overlay'
                visible={isLoading}
                canTarget={toAccessor(isInteractive)(v => !v)}
            >
                {loader}
            </box>
        </overlay>
    );
}
