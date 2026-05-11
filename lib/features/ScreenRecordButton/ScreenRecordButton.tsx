import { createSubprocess, execAsync } from 'ags/process';
import { SymbolButton } from '../../shared';
import { Classes } from '../../types/utils';
import { updateAccessor } from '../../utils/misc';
import cn from 'classnames';

export interface IScreenRecordButton {
    classes?: Classes<'root' | 'label'>;
}

export function ScreenRecordButton(props: IScreenRecordButton) {
    const { classes } = props;

    const isRecording = createSubprocess('0', ['sh', '-c', 'FOLLOW=1 $_APTH_BIN/multimedia/video/get_is_recording']).as(
        (v) => v === '1',
    );

    return (
        <SymbolButton
            isVisible={isRecording}
            onClick={() => execAsync(['sh', '-c', '$_APTH_BIN/multimedia/video/toggle_record'])}
            classes={{
                root: updateAccessor(classes?.root, (root) => cn(root, 'screen-record-button')),
            }}
        >
            <label
                class={updateAccessor(classes?.label, (label) => cn(label, 'screen-record-button__label'))}
                label={isRecording((v) => (v ? '󰑊' : ''))}
            />
        </SymbolButton>
    );
}
