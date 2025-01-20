const path = require('node:path');
const fs = require('node:fs/promises');

async function readDir(dirpath, recursive = false) {
  const dirents = [];
  const dir = await fs.opendir(dirpath);
  async function iter(dir) {
    for await (const dirent of dir) {
      dirents.push(dirent);
      if (recursive && dirent.isDirectory()) {
        iter(await fs.opendir(path.join(dirent.parentPath, dirent.name)));
      }
    }
  }
  await iter(dir);
  return dirents;
}

async function main() {
  const styles = (await readDir('05-merge-styles/styles', true)).filter(
    (dirent) => path.extname(dirent.name) === '.css',
  );
  fs.rm('05-merge-styles/project-dist/bundle.css', { force: true });
  for (const style of styles) {
    const filepath = path.join(style.parentPath, style.name);
    const data = await fs.readFile(filepath, 'utf-8');
    await fs.appendFile('05-merge-styles/project-dist/bundle.css', data);
  }
}

main();
