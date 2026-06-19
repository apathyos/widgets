import App from 'ags/gtk4/app';
import { sendRequest as sendAppRequest } from 'ags/app';
import { Request, RequestOptions } from '../types';
import { ModuleId } from '../../types/app';
import { APP_ID } from '../../constants/os';
import { DistributiveOmit } from '../../types/utils';

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
        const { modifyRequest, id } = opts ?? {};

        const result = getRequestData<T>((modifyRequest
            ? modifyRequest(request)
            : request[0]
        ) || JSON.stringify(''));

        if (result && (result.id !== id || !test(result))) {
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

export const sendRequest = async <R>(request: DistributiveOmit<Request, 'id'>, id?: ModuleId): Promise<R | undefined> => {
    try {
        const response = await sendAppRequest(APP_ID, JSON.stringify({ ...request, id }));

        return JSON.parse(response);
    } catch (e) {
        console.error("Couldn't send the request: ", e);
    }
};

export const broadcastRequest = async (request: DistributiveOmit<Request, 'id'>, exclude?: ModuleId[]) => {
    try {
        const ids = Object.values(ModuleId);
        const excludeWindowsIds = new Set(exclude);

        const responses = ids.filter(id => !excludeWindowsIds.has(id)).map(async (id) => {
            try {
                const response = await sendAppRequest(APP_ID, JSON.stringify({ ...request, id }));
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
