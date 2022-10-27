import { AsmApi } from '@src/AsmApi';
import { ConOutput } from '@src/ports/ConOutput';

export class CliCommands {
    constructor(private api: AsmApi, private conOutput: ConOutput) {}

    private call = async (command: string, callback: () => Promise<unknown>) => {
        const startTime = Date.now();
        const result = await callback();
        const endTime = Date.now();
        const workTime = endTime - startTime;
        this.conOutput.logCall(command, JSON.stringify(result), workTime);
    };

    wordStart = () => this.call('wordStart', () => this.api.wordStart(String(Date.now())));
    wordClose = () => this.call('wordClose', () => this.api.wordClose(String(Date.now())));
    docOpen = async (docname: string) =>
        this.call('docOpen', () => this.api.docOpen(String(Date.now()), docname));
    docClose = () => this.call('docClose', () => this.api.docClose(String(Date.now())));
    getState = () => this.call('getState', () => this.api.getState(String(Date.now())));
    replaceFirstWithText = async (search: string, replace: string) =>
        this.call('replaceFirstWithText', () =>
            this.api.replaceFirstWithText(String(Date.now()), search, replace)
        );

    copyAllToBuffer = () =>
        this.call('copyAllToBuffer', () => this.api.copyAllToBuffer(String(Date.now())));
}
