export interface AsmScriptParams {
    apiUserName: string;
    token: string;
    id?: number;
    name?: string;
    role?: string;
}

interface AsmApiResponse {
    status: number;
}
export class AsmScript {
    async run(params: AsmScriptParams): Promise<AsmApiResponse> {
        const result = {
            status: 200
        };
        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }
}
