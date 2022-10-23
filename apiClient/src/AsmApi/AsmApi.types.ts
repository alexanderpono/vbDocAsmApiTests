export enum AsmApiResponseCode {
    OK = 'OK',
    ERROR_WRITE_REQUEST_BODY = 'ERROR_WRITE_REQUEST_BODY',
    ERROR_WRITE_REQUEST_FLAG = 'ERROR_WRITE_REQUEST_FLAG',
    REMOTE_ANSWER_TIMEOUT = 'REMOTE_ANSWER_TIMEOUT',
    ERROR_READ_RESPONSE_FLAG = 'ERROR_READ_RESPONSE_FLAG',
    USER_ERROR = 'USER_ERROR'
}

export interface AsmApiResponse {
    status: AsmApiResponseCode;
    body?: string;
}

export enum AsmApiError {
    WORD_IS_CLOSED = 'WORD_IS_CLOSED',
    UNKNOWN_COMMAND = 'UNKNOWN_COMMAND',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    NO_OPENED_DOCUMENTS = 'NO_OPENED_DOCUMENTS',
    WORD_IS_ALREADY_STARTED = 'WORD_IS_ALREADY_STARTED'
}

export const RESPONSE_OK: AsmApiResponse = { status: AsmApiResponseCode.OK, body: '' };
export const RESPONSE_WORD_CLOSED: AsmApiResponse = {
    status: AsmApiResponseCode.USER_ERROR,
    body: AsmApiError.WORD_IS_CLOSED
};
export const RESPONSE_UNKNOWN_COMMAND: AsmApiResponse = {
    status: AsmApiResponseCode.USER_ERROR,
    body: AsmApiError.UNKNOWN_COMMAND
};

export const RESPONSE_FILE_NOT_FOUND: AsmApiResponse = {
    status: AsmApiResponseCode.USER_ERROR,
    body: AsmApiError.FILE_NOT_FOUND
};

export const RESPONSE_NO_OPENED_DOCUMENTS: AsmApiResponse = {
    status: AsmApiResponseCode.USER_ERROR,
    body: AsmApiError.NO_OPENED_DOCUMENTS
};

export const RESPONSE_WORD_IS_ALREADY_STARTED: AsmApiResponse = {
    status: AsmApiResponseCode.USER_ERROR,
    body: AsmApiError.WORD_IS_ALREADY_STARTED
};

export const DONT_WAIT_FOR_RESPONSE = false;
export const WAIT_FOR_RESPONSE = true;
