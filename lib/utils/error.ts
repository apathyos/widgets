export const getMessageFromError = (error: unknown) => {
    if (!error) {
        return '';
    }

    if (typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message) {
        return error.message;
    }

    return String(error);
};
