// verifyAnimeIndex.js
const fs = require('fs');
const csv = require('csv-parser');
const crypto = require('crypto');

const CSV_PATH = 'anime.csv';
const JSON_PATH = 'anime_index.json';

let csvCount = 0;
fs.createReadStream(CSV_PATH)
  .pipe(csv())
  .on('data', () => { csvCount++; })
  .on('end', () => {
    const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    const jsonCount = jsonData.length;

    console.log(`CSV rows: ${csvCount}`);
    console.log(`JSON entries: ${jsonCount}`);
    console.log(`Difference: ${csvCount - jsonCount}`);

    if (csvCount === jsonCount) {
      console.log('✅ All rows were successfully converted!');
    } else {
      console.log('⚠️ Some rows were skipped. Investigate CSV for formatting issues.');
    }

    // Optional: add checksum for each JSON entry
    jsonData.forEach(row => {
      row._checksum = crypto.createHash('md5')
                            .update(JSON.stringify(row))
                            .digest('hex');
    });

    fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log('✅ Checksums added for data integrity');
  });
