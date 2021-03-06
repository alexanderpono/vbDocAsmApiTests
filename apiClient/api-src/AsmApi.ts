const fs = require('fs');
import { stat } from 'fs/promises';

export const requestFlagDir = 'request';
export const requestBodyDir = 'request-body';
export const responseFlagDir = 'response';
export const responseBodyDir = 'response-body';

export enum AsmApiResponseCode {
    OK = 'OK',
    ERROR_WRITE_REQUEST_BODY = 'ERROR_WRITE_REQUEST_BODY',
    ERROR_WRITE_REQUEST_FLAG = 'ERROR_WRITE_REQUEST_FLAG',
    REMOTE_ANSWER_TIMEOUT = 'REMOTE_ANSWER_TIMEOUT',
    ERROR_READ_RESPONSE_FLAG = 'ERROR_READ_RESPONSE_FLAG',
    USER_ERROR = 'USER_ERROR'
}

export enum AsmApiError {
    WORD_IS_CLOSED = 'WORD_IS_CLOSED'
}

export interface AsmApiResponse {
    status: AsmApiResponseCode;
    body?: string;
}

export const DONT_WAIT_FOR_RESPONSE = false;
export const WAIT_FOR_RESPONSE = true;
export const RESPONSE_OK: AsmApiResponse = { status: AsmApiResponseCode.OK, body: '' };
export const RESPONSE_WORD_CLOSED: AsmApiResponse = {
    status: AsmApiResponseCode.USER_ERROR,
    body: AsmApiError.WORD_IS_CLOSED
};

function fileCreated(fName: string): Promise<boolean> {
    return new Promise((resolve) => {
        const searchAndWait = () => {
            stat(fName)
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    setTimeout(() => {
                        searchAndWait();
                    }, 500);
                });
        };
        searchAndWait();
    });
}

export class AsmApi {
    _body: string | null = null;
    _workFolder: string | null = null;
    _id: string | null = null;

    constructor(folder: string) {
        this._workFolder = folder;
    }

    setBody(body: string) {
        this._body = body;
        return this;
    }

    setId(val: string) {
        this._id = val;
        return this;
    }

    async send(waitResponse: boolean = WAIT_FOR_RESPONSE): Promise<AsmApiResponse> {
        const fileContent = 'Hello World!';
        const requestFlagFile = `${this._workFolder}/${requestFlagDir}/${this._id}`;
        const requestBodyFile = `${this._workFolder}/${requestBodyDir}/${this._id}`;
        const responseFlagFile = `${this._workFolder}/${responseFlagDir}/${this._id}`;
        const responseBodyFile = `${this._workFolder}/${responseBodyDir}/${this._id}`;
        return new Promise((resolve, reject) => {
            fs.writeFile(requestBodyFile, this._body, (err) => {
                if (err) {
                    reject({
                        status: AsmApiResponseCode.ERROR_WRITE_REQUEST_BODY,
                        err
                    });
                    return;
                }

                fs.writeFile(requestFlagFile, fileContent, (err) => {
                    if (err) {
                        reject({
                            status: AsmApiResponseCode.ERROR_WRITE_REQUEST_FLAG,
                            err
                        });
                        return;
                    }

                    if (waitResponse === DONT_WAIT_FOR_RESPONSE) {
                        resolve({
                            status: AsmApiResponseCode.OK
                        });
                        return;
                    }

                    const slowResponseTimeout = setTimeout(() => {
                        reject({
                            status: AsmApiResponseCode.REMOTE_ANSWER_TIMEOUT,
                            id: this._id
                        });
                    }, 4000);

                    fileCreated(responseFlagFile).then(() => {
                        const flagText = fs.readFileSync(responseFlagFile, 'utf8');
                        const bodyText = fs.readFileSync(responseBodyFile, 'utf8');
                        resolve({
                            status: flagText,
                            body: bodyText
                        });
                        clearTimeout(slowResponseTimeout);
                    });
                });
            });
        });
    }

    wordStart = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody('wordStart').send(WAIT_FOR_RESPONSE);
    };

    wordClose = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody('wordClose').send(WAIT_FOR_RESPONSE);
    };

    docOpen = (id: string, docname: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`docOpen "${docname}"`).send(WAIT_FOR_RESPONSE);
    };
}

export function asmApi(folder: string): AsmApi {
    return new AsmApi(folder);
}
