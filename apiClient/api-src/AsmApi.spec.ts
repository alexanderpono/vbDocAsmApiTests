import {
    asmApi,
    AsmApiResponse,
    DONT_WAIT_FOR_RESPONSE,
    requestBodyDir,
    requestFlagDir
} from './AsmApi';
import { paths } from '../framework/config';
import faker from 'faker';
import { stat } from 'fs/promises';

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

            let fileExists = null;
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

            let fileExists = null;
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

            expect(response).toEqual({ status: 'USER_ERROR', body: 'UNKNOWN_COMMAND' });
        });

        it('throws ERROR_WRITE_REQUEST_BODY if API path is wrong', (done) => {
            const id = String(Date.now());
            asmApi(paths.asmApi.badPath)
                .setId(id)
                .setBody(faker.random.word())
                .send()
                .catch((e) => {
                    expect(e.status).toBe('ERROR_WRITE_REQUEST_BODY');
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
                    expect(e.status).toBe('ERROR_WRITE_REQUEST_FLAG');
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
                    expect(e.status).toBe('REMOTE_ANSWER_TIMEOUT');
                    done();
                });
        });
    });
});
