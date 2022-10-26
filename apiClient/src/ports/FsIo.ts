import fs from 'fs';
import { AsmApiResponse, AsmApiResponseCode } from '@src/AsmApi';
import { unicodeToWin1251 } from './unicodeToWin1251';

export const requestFlagDir = 'request';
export const requestBodyDir = 'request-body';
export const responseFlagDir = 'response';
export const responseBodyDir = 'response-body';

export class FsIo {
    constructor(private workFolder: string) {}

    writeRequestFile = async (id: string, body: string) => {
        const requestBodyFile = `${this.workFolder}/${requestBodyDir}/${id}`;
        const body1251 = unicodeToWin1251(body);

        try {
            await fs.promises.writeFile(requestBodyFile, body1251);
        } catch (err) {
            return Promise.reject({
                status: AsmApiResponseCode.ERROR_WRITE_REQUEST_BODY,
                err
            });
        }
    };

    writeRequestFlag = async (id: string, fileContent: string) => {
        const requestFlagFile = `${this.workFolder}/${requestFlagDir}/${id}`;

        try {
            await fs.promises.writeFile(requestFlagFile, fileContent);
        } catch (err) {
            return Promise.reject({
                status: AsmApiResponseCode.ERROR_WRITE_REQUEST_FLAG,
                err
            });
        }
    };

    waitAndReadAnswer = (id): Promise<AsmApiResponse> => {
        const responseFlagFile = `${this.workFolder}/${responseFlagDir}/${id}`;
        const responseBodyFile = `${this.workFolder}/${responseBodyDir}/${id}`;

        return new Promise((resolve, reject) => {
            const slowResponseTimeout = setTimeout(() => {
                return reject({
                    status: AsmApiResponseCode.REMOTE_ANSWER_TIMEOUT,
                    id
                });
            }, 4000);

            this.fileCreated(responseFlagFile).then(() => {
                const flagText = fs.readFileSync(responseFlagFile, 'utf8');
                const bodyText = fs.readFileSync(responseBodyFile, 'utf8');
                clearTimeout(slowResponseTimeout);
                return resolve({
                    status: flagText as AsmApiResponseCode,
                    body: bodyText
                });
            });
        });
    };

    private fileCreated = (fName: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const searchAndWait = () => {
                fs.promises
                    .stat(fName)
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
    };
}
