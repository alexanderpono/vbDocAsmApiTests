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
    RESPONSE_TARGET_FILE_EXISTS,
    RESPONSE_UNKNOWN_COMMAND,
    RESPONSE_WORD_CLOSED,
    RESPONSE_WORD_IS_ALREADY_STARTED
} from './AsmApi.types';
import { FsIo, requestBodyDir, requestFlagDir } from '@src/ports/FsIo';

const now = () => String(Date.now());

describe('AsmApi', () => {
    const fs = new FsIo(paths.asmApi.path1);
    beforeAll(async () => {
        await asmApi(fs).wordClose(now());
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
            const id = now();
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
            const id = now();
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
            const id = now();
            const response: AsmApiResponse = await asmApi(new FsIo(paths.asmApi.path1))
                .setId(id)
                .setBody(faker.random.word())
                .send();

            expect(typeof response.status).toBe('string');
        });

        it('gets USER_ERROR(UNKNOWN_COMMAND) from .send(unknown command) ', async () => {
            const id = now();
            const response: AsmApiResponse = await asmApi(new FsIo(paths.asmApi.path1))
                .setId(id)
                .setBody(faker.random.word())
                .send();

            expect(response).toEqual(RESPONSE_UNKNOWN_COMMAND);
        });

        it('throws ERROR_WRITE_REQUEST_BODY if API path is wrong', (done) => {
            const id = now();
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
            const id = now();
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
            const id = now();
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
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordClose(now());
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns OK after wordStart-wordClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordClose(now());
            expect(result).toEqual(RESPONSE_OK);
        });
    });

    describe('.docOpen()', () => {
        it('returns WORD_IS_CLOSED after wordClose-docOpen', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                now(),
                paths.fixtures.doc1
            );
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns OK after wordStart-docOpen', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                now(),
                paths.fixtures.doc1
            );
            await asmApi(new FsIo(paths.asmApi.path1)).wordClose(now());
            expect(result).toEqual(RESPONSE_OK);
        });
        it('returns RESPONSE_FILE_NOT_FOUND if docOpen(no such file)', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docOpen(
                now(),
                paths.fixtures.noSuchFile
            );
            expect(result).toEqual(RESPONSE_FILE_NOT_FOUND);
        });
    });

    describe('.docClose()', () => {
        it('returns WORD_IS_CLOSED after wordClose-docClose', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docClose(now());
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns NO_OPENED_DOCUMENTS after wordStart-docClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docClose(now());
            expect(result).toEqual(RESPONSE_NO_OPENED_DOCUMENTS);
        });

        it('returns OK after wordStart-docOpen-docClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            await asmApi(new FsIo(paths.asmApi.path1)).docOpen(now(), paths.fixtures.doc1);
            const result = await asmApi(new FsIo(paths.asmApi.path1)).docClose(now());
            expect(result).toEqual(RESPONSE_OK);
        });
    });

    describe('.wordStart()', () => {
        it('returns OK after wordClose-wordStart', async () => {
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            expect(result).toEqual(RESPONSE_OK);
        });
        it('returns WORD_IS_ALREADY_STARTED after wordStart-wordStart', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            expect(result).toEqual(RESPONSE_WORD_IS_ALREADY_STARTED);
        });
    });

    describe('.copyAllToBuffer()', () => {
        it('returns OK after wordClose-wordStart-docOpen', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            await asmApi(new FsIo(paths.asmApi.path1)).docOpen(now(), paths.fixtures.doc1);
            const result = await asmApi(new FsIo(paths.asmApi.path1)).copyAllToBuffer(now());
            expect(result).toEqual(RESPONSE_OK);
        });

        it('returns WORD_IS_CLOSED after wordClose-copyAllToBuffer', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordClose(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).copyAllToBuffer(now());
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns NO_OPENED_DOCUMENTS after wordStart-docClose', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).copyAllToBuffer(now());
            expect(result).toEqual(RESPONSE_NO_OPENED_DOCUMENTS);
        });
    });

    describe('.pasteToEnd()', () => {
        it('returns OK after wordClose-wordStart-docOpen-copyAllToBuffer', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            await asmApi(new FsIo(paths.asmApi.path1)).docOpen(now(), paths.fixtures.doc1);
            await asmApi(new FsIo(paths.asmApi.path1)).copyAllToBuffer(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).pasteToEnd(now());
            await asmApi(new FsIo(paths.asmApi.path1)).docClose(now());
            expect(result).toEqual(RESPONSE_OK);
        });

        it('returns WORD_IS_CLOSED after wordClose-copyAllToBuffer', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordClose(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).pasteToEnd(now());
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns NO_OPENED_DOCUMENTS after wordStart', async () => {
            await asmApi(new FsIo(paths.asmApi.path1)).wordStart(now());
            const result = await asmApi(new FsIo(paths.asmApi.path1)).pasteToEnd(now());
            expect(result).toEqual(RESPONSE_NO_OPENED_DOCUMENTS);
        });
    });

    describe('.copyRowToBuffer()', () => {
        it('returns OK after wordStart-docOpen', async () => {
            await asmApi(fs).wordStart(now());
            await asmApi(fs).docOpen(now(), paths.fixtures.docRow);
            const result = await asmApi(fs).copyRowToBuffer(now());
            await asmApi(fs).docClose(now());
            expect(result).toEqual(RESPONSE_OK);
        });

        it('returns WORD_IS_CLOSED after wordClose-copyAllToBuffer', async () => {
            await asmApi(fs).wordClose(now());
            const result = await asmApi(fs).copyRowToBuffer(now());
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns NO_OPENED_DOCUMENTS after wordStart', async () => {
            await asmApi(fs).wordStart(now());
            const result = await asmApi(fs).copyRowToBuffer(now());
            expect(result).toEqual(RESPONSE_NO_OPENED_DOCUMENTS);
        });
    });

    describe('.saveAs()', () => {
        it('returns OK after wordStart-docOpen if target does not exist', async () => {
            await asmApi(fs).deleteFile(now(), paths.fixtures.docSaveAs);
            await asmApi(fs).wordStart(now());
            await asmApi(fs).docOpen(now(), paths.fixtures.doc1);
            const result = await asmApi(fs).saveAs(now(), paths.fixtures.docSaveAs);
            await asmApi(fs).wordClose(now());
            await asmApi(fs).deleteFile(now(), paths.fixtures.docSaveAs);
            expect(result).toEqual(RESPONSE_OK);
        });

        it('returns TARGET_FILE_EXISTS after wordStart-docOpen if target exists', async () => {
            await asmApi(fs).deleteFile(now(), paths.fixtures.docSaveAs);
            await asmApi(fs).wordStart(now());
            await asmApi(fs).docOpen(now(), paths.fixtures.doc1);
            await asmApi(fs).saveAs(now(), paths.fixtures.docSaveAs);
            const result = await asmApi(fs).saveAs(now(), paths.fixtures.docSaveAs);
            await asmApi(fs).wordClose(now());
            await asmApi(fs).deleteFile(now(), paths.fixtures.docSaveAs);
            expect(result).toEqual(RESPONSE_TARGET_FILE_EXISTS);
        });

        it('returns WORD_IS_CLOSED after wordClose', async () => {
            await asmApi(fs).wordClose(now());
            const result = await asmApi(fs).saveAs(now(), paths.fixtures.docSaveAs);
            expect(result).toEqual(RESPONSE_WORD_CLOSED);
        });
        it('returns NO_OPENED_DOCUMENTS after wordStart', async () => {
            await asmApi(fs).wordStart(now());
            const result = await asmApi(fs).saveAs(now(), paths.fixtures.docSaveAs);
            expect(result).toEqual(RESPONSE_NO_OPENED_DOCUMENTS);
        });
    });

    afterEach(async () => {
        await asmApi(fs).wordClose(now());
    });
});
