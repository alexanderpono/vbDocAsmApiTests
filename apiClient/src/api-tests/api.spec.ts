import { expect } from '@jest/globals';

import { docAsmApiProvider as apiProvider } from '@src/testFramework';
import { ParamsBuilder } from '@src/testFramework/builder/ParamsBuilder';

describe('AsmApi', () => {
    const runScript = async () => {
        const params = new ParamsBuilder().addGoodToken().addAdminUser().generate();
        const r = await apiProvider().script().run(params);
        return r;
    };

    it('receives code 200', async () => {
        const r = await runScript();
        expect(r.status).toEqual(200);
    });
});
