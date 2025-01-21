const fs = require('fs/promises');
const path = require('path');

const folderpath = './03-files-in-folder/secret-folder';

async function main() {
  const dir = await fs.opendir(folderpath);
  for await (const dirent of dir) {
    if (dirent.isFile()) {
      const basename = path.basename(dirent.name, path.extname(dirent.name));
      const extname = path.extname(dirent.name);

      const filepath = path.join(folderpath, dirent.name);
      fs.stat(filepath).then((stats) => {
        const filesize = stats.size;
        console.log(`${basename} - ${extname.slice(1)} - ${filesize}b`);
      });
    }
  }
}

main();
