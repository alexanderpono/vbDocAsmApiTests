import { AsmApi } from '@src/AsmApi';
import { ConOutput } from '@src/ports/ConOutput';

const now = () => String(Date.now());
export class CliCommands {
    constructor(private api: AsmApi, private conOutput: ConOutput) {}

    private call = async (command: string, callback: () => Promise<unknown>) => {
        const startTime = Date.now();
        const result = await callback();
        const endTime = Date.now();
        const workTime = endTime - startTime;
        this.conOutput.logCall(command, JSON.stringify(result), workTime);
    };

    wordStart = () => this.call('wordStart', () => this.api.wordStart(now()));
    wordClose = () => this.call('wordClose', () => this.api.wordClose(now()));
    docOpen = async (docname: string) =>
        this.call(`docOpen(${docname})`, () => this.api.docOpen(now(), docname));
    docClose = () => this.call('docClose', () => this.api.docClose(now()));
    getState = () => this.call('getState', () => this.api.getState(now()));
    replaceFirstWithText = async (search: string, replace: string) =>
        this.call(`replaceFirstWithText(${search}, ${replace})`, () =>
            this.api.replaceFirstWithText(now(), search, replace)
        );
    copyAllToBuffer = () => this.call('copyAllToBuffer', () => this.api.copyAllToBuffer(now()));
    pasteToEnd = () => this.call('pasteToEnd', () => this.api.pasteToEnd(now()));
}
