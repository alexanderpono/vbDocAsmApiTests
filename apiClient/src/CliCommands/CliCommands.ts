import { AsmApi } from '@src/AsmApi';
import { ConOutput } from '@src/ports/ConOutput';

export class CliCommands {
    constructor(private api: AsmApi, private conOutput: ConOutput) {}

    private call = async (callback: () => Promise<unknown>) => {
        const startTime = Date.now();
        const result = await callback();
        const endTime = Date.now();
        const workTime = endTime - startTime;
        this.conOutput.logCall(JSON.stringify(result), workTime);
    };

    wordStart = () => this.call(() => this.api.wordStart(String(Date.now())));
    wordClose = () => this.call(() => this.api.wordClose(String(Date.now())));
    docOpen = async (docname: string) =>
        this.call(() => this.api.docOpen(String(Date.now()), docname));
}
