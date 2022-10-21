import { asmApi } from './src/AsmApi';
import { paths } from './src/testFramework/config';
const { description, name, version } = require('./package.json');
import { program } from 'commander';

const chalk = require('chalk');

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
program
    .command('wordStart')
    .description('start word')
    .action(() => {
        call(() => asmApi(paths.asmApi.path1).wordStart(String(Date.now())));
    });

program
    .command('wordClose')
    .description('close word')
    .action(() => {
        call(() => asmApi(paths.asmApi.path1).wordClose(String(Date.now())));
    });

program
    .command('docOpen')
    .description('open document')
    .argument('<docname>')
    .action(async (docname: string) => {
        call(() => asmApi(paths.asmApi.path1).docOpen(String(Date.now()), docname));
    });

program.name(name).version(version).description(description);

program.parse(process.argv);
