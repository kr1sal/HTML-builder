const fs = require('fs/promises');
const path = require('path');

const folderpath = './03-files-in-folder/secret-folder';

fs.readdir('./03-files-in-folder/secret-folder').then((files) => {
  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    const extname = path.extname(file);

    const filepath = path.join(folderpath, file);
    fs.stat(filepath).then((stats) => {
      const filesize = stats.size;
      console.log(`${basename} - ${extname.slice(1)} - ${filesize}b`);
    });
  }
});
