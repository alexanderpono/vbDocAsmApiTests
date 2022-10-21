const fs = require('fs');
import { stat } from 'fs/promises';
import { AsmApiResponse, AsmApiResponseCode } from './AsmApi.types';

export const requestFlagDir = 'request';
export const requestBodyDir = 'request-body';
export const responseFlagDir = 'response';
export const responseBodyDir = 'response-body';

export const DONT_WAIT_FOR_RESPONSE = false;
export const WAIT_FOR_RESPONSE = true;

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

        try {
            await fs.promises.writeFile(requestBodyFile, this._body);
        } catch (err) {
            return Promise.reject({
                status: AsmApiResponseCode.ERROR_WRITE_REQUEST_BODY,
                err
            });
        }

        try {
            await fs.promises.writeFile(requestFlagFile, fileContent);
        } catch (err) {
            return Promise.reject({
                status: AsmApiResponseCode.ERROR_WRITE_REQUEST_FLAG,
                err
            });
        }

        if (waitResponse === DONT_WAIT_FOR_RESPONSE) {
            return Promise.resolve({
                status: AsmApiResponseCode.OK
            });
        }

        return new Promise((resolve, reject) => {
            const slowResponseTimeout = setTimeout(() => {
                return reject({
                    status: AsmApiResponseCode.REMOTE_ANSWER_TIMEOUT,
                    id: this._id
                });
            }, 4000);

            fileCreated(responseFlagFile).then(() => {
                const flagText = fs.readFileSync(responseFlagFile, 'utf8');
                const bodyText = fs.readFileSync(responseBodyFile, 'utf8');
                clearTimeout(slowResponseTimeout);
                return resolve({
                    status: flagText,
                    body: bodyText
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

    static create(folder: string): AsmApi {
        return new AsmApi(folder);
    }
}

export function asmApi(folder: string): AsmApi {
    return AsmApi.create(folder);
}
