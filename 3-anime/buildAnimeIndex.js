const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Paths
const CSV_PATH = path.join(__dirname, 'anime.csv');
const OUTPUT_JSON = path.join(__dirname, 'anime_index.json');

// Array to hold entries
const animeList = [];

// Read CSV
fs.createReadStream(CSV_PATH)
  .pipe(csv())
  .on('data', (row) => {
    animeList.push({
      anime_id: row.anime_id || "",
      title: row.name || "",
      japanese_title: "",        // Placeholder
      type: row.type || "",
      studio: "",               // Placeholder
      director: "",             // Placeholder
      episodes: row.episodes ? parseInt(row.episodes) : null,
      genres: row.genre ? row.genre.split(',').map(g => g.trim()) : [],
      rating: row.rating ? parseFloat(row.rating) : null,
      members: row.members ? parseInt(row.members) : null,
      plot_summary: "",
      main_cast: [],            // Placeholder for voice actors
      related_media: [],        // Placeholder for games/manga/etc
      sources: ["CSV Dataset"]
    });
  })
  .on('end', () => {
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(animeList, null, 2), 'utf-8');
    console.log(`✅ Anime index created: ${OUTPUT_JSON}`);
  });
