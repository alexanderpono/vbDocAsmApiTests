const { description, name, version } = require('./package.json');
import { program } from 'commander';
import { AsmApi } from './src/AsmApi';
import { CliCommands } from './src/CliCommands';
import { ConOutput } from './src/ports/ConOutput';
import { FsIo } from './src/ports/FsIo';
import { paths } from './src/testFramework/config';

const commands = new CliCommands(new AsmApi(new FsIo(paths.asmApi.path1)), new ConOutput());

program.command('wordStart').description('start word').action(commands.wordStart);
program.command('wordClose').description('close word').action(commands.wordClose);
program
    .command('docOpen')
    .description('open document')
    .argument('<docname>')
    .action(commands.docOpen);
program.command('docClose').description('close active document').action(commands.docClose);
program.command('getState').description('get state of assembler').action(commands.getState);
program
    .command('replaceFirstWithText')
    .description('replace <search> with <replace>')
    .argument('<search>')
    .argument('<replace>')
    .action(commands.replaceFirstWithText);
program.name(name).version(version).description(description);
program.parse(process.argv);
