import { asmApi } from './api-src/AsmApi';
import { paths } from './framework/config';

const commander = require('commander'),
    chalk = require('chalk');

function toSeconds(millisec: number): number {
    return Math.round(millisec / 10) / 100;
}

async function call(callback: () => Promise<unknown>) {
    const startTime = Date.now();
    const result = await callback();
    const endTime = Date.now();
    const workTime = endTime - startTime;
    console.log(chalk.green('wordStart', JSON.stringify(result), toSeconds(workTime)));
}
commander
    .command('wordStart')
    .description('start word')
    .action(() => {
        call(() => asmApi(paths.asmApi.path1).wordStart(String(Date.now())));
    });

commander
    .command('wordClose')
    .description('close word')
    .action(() => {
        call(() => asmApi(paths.asmApi.path1).wordClose(String(Date.now())));
    });

commander
    .command('docOpen')
    .description('open document')
    .argument('<docname>')
    .action(async (docname: string) => {
        call(() => asmApi(paths.asmApi.path1).docOpen(String(Date.now()), docname));
    });

commander.version('1.0.0').description('Configuration files creator.');

commander.parse(process.argv);
