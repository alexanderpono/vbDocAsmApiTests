import chalk from 'chalk';

export class ConOutput {
    logCall = (command: string, result: string, workTime: number) =>
        console.log(chalk.green(command, '=>', result, this.toSeconds(workTime)));

    private toSeconds = (millisec: number): number => {
        return Math.round(millisec / 10) / 100;
    };
}
