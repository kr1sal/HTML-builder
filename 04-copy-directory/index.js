const fs = require('node:fs/promises');
const path = require('node:path');

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

async function copyDir(src, dest, mode = 0) {
  const dirents = await readDir(src, true);
  for (const dirent of dirents) {
    const srcAbsoluteDirpath = dirent.parentPath;
    const srcAbsoluteFilepath = path.join(srcAbsoluteDirpath, dirent.name);
    const relativeDirpath = path.relative(src, dirent.parentPath);
    // const relativeFilepath = path.relative(src, srcAbsoluteFilepath);
    const destAbsoluteDirpath = path.join(dest, relativeDirpath);
    const destAbsoluteFilepath = path.join(destAbsoluteDirpath, dirent.name);
    if (dirent.isDirectory()) {
      if (!(await exists(destAbsoluteFilepath)))
        await fs.mkdir(destAbsoluteFilepath);
    } else {
      await fs.copyFile(srcAbsoluteFilepath, destAbsoluteFilepath, mode);
    }
  }
}

async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists('./04-copy-directory/files-copy'))) {
    await fs.mkdir('./04-copy-directory/files-copy');
  }
  await copyDir('./04-copy-directory/files', './04-copy-directory/files-copy');
}

main();
