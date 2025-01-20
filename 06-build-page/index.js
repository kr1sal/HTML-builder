const path = require('node:path');
const fs = require('node:fs/promises');

const distDirpath = path.join(__dirname, 'project-dist');

async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

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

async function packStyles() {
  const styles = (await readDir(__dirname, 'styles')).filter(
    (dirent) => path.extname(dirent.name) === '.css',
  );
  fs.rm(path.join(distDirpath, 'style.css'), { force: true });
  for (const style of styles) {
    const filepath = path.join(style.parentPath, style.name);
    const data = await fs.readFile(filepath, 'utf-8');
    await fs.appendFile(path.join(distDirpath, 'style.css'), data);
  }
}

async function insertComponents() {
  const template = await fs.readFile(
    path.join(__dirname, 'template.html'),
    'utf-8',
  );
  let data = template;
  const dirents = await readDir(path.join(__dirname, 'components'));
  for (const match of template.matchAll(/\{\{.+\}\}/g)) {
    const componentName = match[0].slice(2, match[0].length - 2).toLowerCase();
    for (const dirent of dirents) {
      if (
        path.extname(dirent.name) === '.html' &&
        path.basename(dirent.name, '.html').toLowerCase() === componentName
      ) {
        const componentData = await fs.readFile(
          path.join(dirent.parentPath, dirent.name),
          'utf-8',
        );
        data = data.replace(match[0], componentData);
      }
    }
  }
  await fs.writeFile(path.join(distDirpath, 'index.html'), data);
}

async function copyAssets() {
  if (!(await exists(path.join(distDirpath, 'assets')))) {
    await fs.mkdir(path.join(distDirpath, 'assets'));
  }
  await copyDir(
    path.join(__dirname, 'assets'),
    path.join(distDirpath, 'assets'),
  );
}

async function main() {
  await fs.rm(distDirpath, { recursive: true, force: true });
  if (!(await exists(distDirpath))) await fs.mkdir(distDirpath);
  packStyles();
  insertComponents();
  copyAssets();
}

main();
