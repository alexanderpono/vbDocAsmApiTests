import {
    AsmApiGetStateResponse,
    AsmApiResponse,
    AsmApiResponseCode,
    defaultAsmApiGetStateResponse,
    DONT_WAIT_FOR_RESPONSE,
    WAIT_FOR_RESPONSE
} from './AsmApi.types';
import { FsIo } from '@src/ports/FsIo';

export class AsmApi {
    _body = '';
    _id = '';

    constructor(private fs: FsIo) {}

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

        try {
            await this.fs.writeRequestFile(this._id, this._body);
            await this.fs.writeRequestFlag(this._id, fileContent);

            if (waitResponse === DONT_WAIT_FOR_RESPONSE) {
                return Promise.resolve({
                    status: AsmApiResponseCode.OK
                });
            }

            const okAnswer = await this.fs.waitAndReadAnswer(this._id);
            return okAnswer;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    wordStart = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody('wordStart').send(WAIT_FOR_RESPONSE);
    };

    wordClose = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody('wordClose').send(WAIT_FOR_RESPONSE);
    };

    docClose = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody('docClose').send(WAIT_FOR_RESPONSE);
    };

    docOpen = (id: string, docname: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`docOpen "${docname}"`).send(WAIT_FOR_RESPONSE);
    };

    getState = async (id: string): Promise<AsmApiGetStateResponse> => {
        const response = await this.setId(id).setBody('getState').send(WAIT_FOR_RESPONSE);
        let bodyS = typeof response.body === 'string' ? response.body : '';
        bodyS = bodyS.trim();
        const data = JSON.parse(bodyS);
        return Promise.resolve({ ...defaultAsmApiGetStateResponse, ...data });
    };

    replaceFirstWithText = (
        id: string,
        search: string,
        replace: string
    ): Promise<AsmApiResponse> => {
        const body = `replaceFirstWithText "${search}" "${replace}"`;
        return this.setId(id).setBody(body).send(WAIT_FOR_RESPONSE);
    };

    copyAllToBuffer = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`copyAllToBuffer`).send(WAIT_FOR_RESPONSE);
    };

    pasteToEnd = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`pasteToEnd`).send(WAIT_FOR_RESPONSE);
    };

    copyRowToBuffer = (id: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`copyRowToBuffer`).send(WAIT_FOR_RESPONSE);
    };

    saveAs = (id: string, docname: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`saveAs "${docname}"`).send(WAIT_FOR_RESPONSE);
    };

    deleteFile = (id: string, docname: string): Promise<AsmApiResponse> => {
        return this.setId(id).setBody(`deleteFile "${docname}"`).send(WAIT_FOR_RESPONSE);
    };

    static create(fs: FsIo): AsmApi {
        return new AsmApi(fs);
    }
}

export function asmApi(fs: FsIo): AsmApi {
    return AsmApi.create(fs);
}
