const fs = require('fs');
const rl = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const writeStream = fs.createWriteStream('./02-write-file/text.txt', 'utf-8');
const rli = rl.createInterface({ input, output });

process.on('SIGINT', () => {
  console.log('\nGoodbye!');
  process.exit();
});

process.on('exit', (code) => {
  writeStream.end();
  console.log('Exited with status code:', code);
});

rli.on('line', (input) => {
  writeStream.write(input + '\n');
});

console.log('Welcome! Just enter text');
