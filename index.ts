import { asmApi, WAIT_FOR_RESPONSE } from './api-src/AsmApi';
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
    .action(async () => {
        const id = String(Date.now());
        call(
            async () =>
                await asmApi(paths.asmApi.path1)
                    .setId(id)
                    .setBody('wordStart')
                    .send(WAIT_FOR_RESPONSE)
        );
    });

commander
    .command('wordClose')
    .description('close word')
    .action(async () => {
        const id = String(Date.now());
        call(
            async () =>
                await asmApi(paths.asmApi.path1)
                    .setId(id)
                    .setBody('wordClose')
                    .send(WAIT_FOR_RESPONSE)
        );
    });

commander.version('1.0.0').description('Configuration files creator.');

commander.parse(process.argv);
