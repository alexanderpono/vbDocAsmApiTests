import { asmApi, DONT_WAIT_FOR_RESPONSE, requestBodyDir, requestFlagDir } from './AsmApi';
import { paths } from '../../src/testFramework/config';
import faker from 'faker';
import { stat } from 'fs/promises';
import {
    AsmApiResponse,
    AsmApiResponseCode,
    RESPONSE_FILE_NOT_FOUND,
    RESPONSE_OK,
    RESPONSE_UNKNOWN_COMMAND,
    RESPONSE_WORD_CLOSED
} from './AsmApi.types';

describe('AsmApi', () => {
    test('.constructor() sets _workFolder', () => {
        const w = faker.random.words();
        expect(asmApi(w)._workFolder).toEqual(w);
    });

    test('.setBody() sets _body', () => {
        const w = faker.random.word();
        expect(asmApi(paths.asmApi.path1).setBody(w)._body).toEqual(w);
    });

    test('.setId() sets _id', () => {
        const w = faker.random.word();
        expect(asmApi(paths.asmApi.path1).setId(w)._id).toEqual(w);
    });

    describe('.send()', () => {
        it('creates flag file', async () => {
            const id = String(Date.now());
            await asmApi(paths.asmApi.path1)
                .setId(id)
                .setBody(faker.random.word())
                .send(DONT_WAIT_FOR_RESPONSE);

            const path = `${paths.asmApi.path1}/${requestFlagDir}/${id}`;

            let fileExists: boolean | null = null;
            try {
                await stat(path);
                fileExists = true;
            } catch {
                fileExists = false;
            }

            expect(fileExists).toBe(true);
        });

        it('creates body file', async () => {
            const id = String(Date.now());
            await asmApi(paths.asmApi.path1)
                .setId(id)
                .setBody(faker.random.word())
                .send(DONT_WAIT_FOR_RESPONSE);

            const path = `${paths.asmApi.path1}/${requestBodyDir}/${id}`;

            let fileExists: boolean | null = null;
            try {
                await stat(path);
                fileExists = true;
            } catch {
                fileExists = false;
            }

            expect(fileExists).toBe(true);
        });

        it('receives answer', async () => {
            const id = String(Date.now());
            const response: AsmApiResponse = await asmApi(paths.asmApi.path1)
                .setId(id)
                .setBody(faker.random.word())
                .send();

            expect(typeof response.status).toBe('string');
        });

        it('gets USER_ERROR(UNKNOWN_COMMAND) from .send(unknown command) ', async () => {
            const id = String(Date.now());
            const response: AsmApiResponse = await asmApi(paths.asmApi.path1)
                .setId(id)
                .setBody(faker.random.word())
                .send();

            expect(response).toEqual(RESPONSE_UNKNOWN_COMMAND);
        });

        it('throws ERROR_WRITE_REQUEST_BODY if API path is wrong', (done) => {
            const id = String(Date.now());
            asmApi(paths.asmApi.badPath)
                .setId(id)
                .setBody(faker.random.word())
                .send()
                .catch((e) => {
                    expect(e.status).toBe(AsmApiResponseCode.ERROR_WRITE_REQUEST_BODY);
                    done();
                });
        });

        it('throws ERROR_WRITE_REQUEST_FLAG if API path is wrong', (done) => {
            const id = String(Date.now());
            asmApi(paths.asmApi.withoutRequestFlag)
                .setId(id)
                .setBody(faker.random.word())
                .send()
                .catch((e) => {
                    expect(e.status).toBe(AsmApiResponseCode.ERROR_WRITE_REQUEST_FLAG);
                    done();
                });
        });

        it('throws TIMEOUT if API server does not respond', (done) => {
            const id = String(Date.now());
            asmApi(paths.asmApi.apiServerDoesNotRun)
                .setId(id)
                .setBody(faker.random.word())
                .send()
                .catch((e) => {
                    expect(e.status).toBe(AsmApiResponseCode.REMOTE_ANSWER_TIMEOUT);
                    done();
                });
        });
    });

    describe('.wordClose()', () => {
        it('returns WORD_IS_CLOSED after wordClose-wordClose', async () => {
            await asmApi(paths.asmApi.path1).wordClose(String(Date.now()));
            const result = await asmApi(paths.asmApi.path1).wordClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns OK after wordStart-wordClose', async () => {
            await asmApi(paths.asmApi.path1).wordStart(String(Date.now()));
            const result = await asmApi(paths.asmApi.path1).wordClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_OK);
        });
    });

    describe('.docOpen()', () => {
        it('returns WORD_IS_CLOSED after wordClose-docOpen', async () => {
            await asmApi(paths.asmApi.path1).wordClose(String(Date.now()));
            const result = await asmApi(paths.asmApi.path1).docOpen(
                String(Date.now()),
                paths.fixtures.doc1
            );
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns OK after wordStart-docOpen', async () => {
            await asmApi(paths.asmApi.path1).wordStart(String(Date.now()));
            const result = await asmApi(paths.asmApi.path1).docOpen(
                String(Date.now()),
                paths.fixtures.doc1
            );
            await asmApi(paths.asmApi.path1).wordClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_OK);
        });
        it('returns RESPONSE_FILE_NOT_FOUND if docOpen(no such file)', async () => {
            await asmApi(paths.asmApi.path1).wordClose(String(Date.now()));
            const result = await asmApi(paths.asmApi.path1).docOpen(
                String(Date.now()),
                paths.fixtures.noSuchFile
            );
            expect(result).toEqual(RESPONSE_FILE_NOT_FOUND);
        });
    });
});
