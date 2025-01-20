const fs = require('fs');

const readStream = fs.createReadStream('./01-read-file/text.txt', 'utf-8');
readStream.on('data', (data, err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
