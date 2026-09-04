import GLib from 'gi://GLib?version=2.0';

export const getTextOfLines = (args: {
    lines: number;
    text: string;
}) => {
    const { lines, text } = args;

    if (lines <= 0) {
        return '';
    }

    return Array.from({ length: lines }, () => text).join('\n');
};

export const getStringList = <T>(arr: T[], cb: (item: T) => string) => {
    return arr.reduce((acc, item, idx) => {
        return acc + (idx > 0 ? ', ' : '') + cb(item);
    }, '');
};

export const getStringFromBytes = (bytes: GLib.Bytes) => {
    const data = bytes.get_data();

    if (!data || !data.length) {
        return '';
    }

    return new TextDecoder('utf-8').decode(data);
};
