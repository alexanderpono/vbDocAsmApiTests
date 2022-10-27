import { asmApi } from '.';
import { paths } from '@src/testFramework/config';
import faker from 'faker';
import { stat } from 'fs/promises';
import {
    AsmApiResponse,
    AsmApiResponseCode,
    DONT_WAIT_FOR_RESPONSE,
    RESPONSE_FILE_NOT_FOUND,
    RESPONSE_NO_OPENED_DOCUMENTS,
    RESPONSE_OK,
    RESPONSE_UNKNOWN_COMMAND,
    RESPONSE_WORD_CLOSED,
    RESPONSE_WORD_IS_ALREADY_STARTED
} from './AsmApi.types';
import { FsIo, requestBodyDir, requestFlagDir } from '@src/ports/FsIo';

describe('AsmApi', () => {
    beforeAll(async () => {
        await asmApi(new FsIo(paths.asmApi.path1)).wordClose(String(Date.now()));
    });

    test('.setBody() sets _body', () => {
        const w = faker.random.word();
        expect(asmApi(new FsIo(paths.asmApi.path1)).setBody(w)._body).toEqual(w);
    });

    test('.setId() sets _id', () => {
        const w = faker.random.word();
        expect(asmApi(new FsIo(paths.asmApi.path1)).setId(w)._id).toEqual(w);
    });

    describe('.send()', () => {
        it('creates flag file', async () => {
            const id = String(Date.now());
            await asmApi(new FsIo(paths.asmApi.path1))
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
            await asmApi(new FsIo(paths.asmApi.path1))
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
            const response: AsmApiResponse = await asmApi(new FsIo(paths.asmApi.path1))
                .setId(id)
                .setBody(faker.random.word())
                .send();

            expect(typeof response.status).toBe('string');
        });

        it('gets USER_ERROR(UNKNOWN_COMMAND) from .send(unknown command) ', async () => {
            const id = String(Date.now());
            const response: AsmApiResponse = await asmApi(new FsIo(paths.asmApi.path1))
                .setId(id)
                .setBody(faker.random.word())
                .send();

            expect(response).toEqual(RESPONSE_UNKNOWN_COMMAND);
        });

        it('throws ERROR_WRITE_REQUEST_BODY if API path is wrong', (done) => {
            const id = String(Date.now());
            asmApi(new FsIo(paths.asmApi.badPath))
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
            asmApi(new FsIo(paths.asmApi.withoutRequestFlag))
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
            asmApi(new FsIo(paths.asmApi.apiServerDoesNotRun))
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
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns OK after wordStart-wordClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_OK);
        });
    });

    describe('.docOpen()', () => {
        it('returns WORD_IS_CLOSED after wordClose-docOpen', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                String(Date.now()),
                paths.fixtures.doc1
            );
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns OK after wordStart-docOpen', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                String(Date.now()),
                paths.fixtures.doc1
            );
            await asmApi(new FsIo(paths.asmApi.path1)).wordClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_OK);
        });
        it('returns RESPONSE_FILE_NOT_FOUND if docOpen(no such file)', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                String(Date.now()),
                paths.fixtures.noSuchFile
            );
            expect(result).toEqual(RESPONSE_FILE_NOT_FOUND);
        });
    });

    describe('.docClose()', () => {
        it('returns WORD_IS_CLOSED after wordClose-docClose', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns NO_OPENED_DOCUMENTS after wordStart-docClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_NO_OPENED_DOCUMENTS);
        });

        it('returns OK after wordStart-docOpen-docClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                String(Date.now()),
                paths.fixtures.doc1
            );
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docClose(String(Date.now()));
            expect(result).toEqual(RESPONSE_OK);
        });
    });

    describe('.wordStart()', () => {
        it('returns OK after wordClose-wordStart', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            expect(result).toEqual(RESPONSE_OK);
        });
        it('returns WORD_IS_ALREADY_STARTED after wordStart-wordStart', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            expect(result).toEqual(RESPONSE_WORD_IS_ALREADY_STARTED);
        });
    });

    describe('.copyAllToBuffer()', () => {
        it('returns OK after wordClose-wordStart-docOpen', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(String(Date.now()));
            await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                String(Date.now()),
                paths.fixtures.doc1
            );
            const result = await asmApi(new FsIo(paths.asmApi.path1)).copyAllToBuffer(
                String(Date.now())
            );
            expect(result).toEqual(RESPONSE_OK);
        });
    });

    afterEach(async () => {
        await asmApi(new FsIo(paths.asmApi.path1)).wordClose(String(Date.now()));
    });
});
