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
program
    .command('copyAllToBuffer')
    .description('select all text and copy to clipboard')
    .action(commands.copyAllToBuffer);
program
    .command('pasteToEnd')
    .description('paste from clipboard to the end of the document')
    .action(commands.pasteToEnd);
program
    .command('copyRowToBuffer')
    .description('copy current row in current table to buffer')
    .action(commands.copyRowToBuffer);
program
    .command('saveAs')
    .description('save active document as')
    .argument('<docname>')
    .action(commands.saveAs);
program
    .command('deleteFile')
    .description('delete file')
    .argument('<docname>')
    .action(commands.deleteFile);

program.name(name).version(version).description(description);
program.parse(process.argv);
