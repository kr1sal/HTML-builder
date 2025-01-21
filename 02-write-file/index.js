const fs = require('fs');
const rl = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const writeStream = fs.createWriteStream('./02-write-file/text.txt', 'utf-8');
const rli = rl.createInterface({ input, output, terminal: false });

process.stdin.setRawMode(false);

process.on('SIGINT', () => {
  console.log();
  process.exit();
});

process.on('exit', (code) => {
  writeStream.end();
  console.log('Goodbye!');
  console.log('Exited with status code:', code);
});

rli.on('line', (input) => {
  if (input === 'exit') {
    process.exit();
  } else {
    writeStream.write(input + '\n');
  }
});

console.log('Welcome! Just enter text');
