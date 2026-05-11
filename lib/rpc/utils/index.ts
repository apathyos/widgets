import App from 'ags/gtk4/app';
import { sendRequest as sendAppRequest } from 'ags/app';
import { Request, RequestOptions } from '../types';
import { WindowId } from '../../types/window';

export const getRequestData = <T extends Request>(string: string): T | null => {
    try {
        return JSON.parse(string);
    } catch (e) {
        console.error("Couldn't retrieve the request data: ", e);
    }

    return null;
};

export const handleRequest =
    <T extends Request>(
        test: (req: T) => req is T,
        task: (request: T) => Promise<void> | void,
        opts?: RequestOptions<T>,
    ) =>
    async (_: typeof App, request: string[], response: (str: string) => void) => {
        const { modifyRequest } = opts ?? {};

        const result = getRequestData<T>((modifyRequest ? modifyRequest(request) : request[0]) || JSON.stringify(''));

        if (result && !test(result)) {
            return;
        }

        if (result) {
            await task?.(result);
        }

        let respondWith = JSON.stringify({ status: result === null ? 'error' : 'ok' });

        if (typeof opts?.respondWith === 'function') {
            respondWith = opts.respondWith(result);
        } else if (typeof opts?.respondWith === 'string') {
            respondWith = opts.respondWith;
        }

        response(respondWith);
    };

export const sendRequest = async <R>(id: WindowId, request: Request): Promise<R | undefined> => {
    try {
        const response = await sendAppRequest(id, JSON.stringify(request));
        // request.id = id;
        // const response = await sendAppRequest('apathyos', JSON.stringify(request));

        return JSON.parse(response);
    } catch (e) {
        console.error("Couldn't send the request: ", e);
    }
};

export const broadcastRequest = async (request: Request, exclude?: WindowId[]) => {
    try {
        const ids = Object.values(WindowId);
        const excludeWindowsIds = new Set(exclude);

        const responses = ids.filter(id => !excludeWindowsIds.has(id)).map(async (id) => {
            try {
                const response = await sendAppRequest(id, JSON.stringify(request));
                return { id, response };
            } catch (error) {
                return { id, error };
            }
        });

        return responses;
    } catch (e) {
        console.error("Couldn't broadcast the request: ", e);
    }

    return [];
};
