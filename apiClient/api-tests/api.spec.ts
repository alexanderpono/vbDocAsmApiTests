import { expect } from '@jest/globals';

import { docAsmApiProvider as apiProvider } from '../framework';
import { ParamsBuilder } from '../framework/builder/ParamsBuilder';

interface User {
    name: string;
    role: string;
    id: number;
}
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
