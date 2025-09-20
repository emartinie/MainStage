// mapAnime.js
const fs = require("fs");

const inputFile = "anime_full.json";
const outputFile = "anime_full_mapped.json";

const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

const anime = data; // assuming the current JSON is just an array

// Calculate meta info
const totalEntries = anime.length;

const genresSet = new Set();
let withVoiceActors = 0;
let withJapaneseTitle = 0;
let minEpisodes = Infinity;
let maxEpisodes = 0;
let popularityRange = [Infinity, 0];

anime.forEach(a => {
  if (a.genres) a.genres.forEach(g => genresSet.add(g));
  if (a.characters && a.characters.edges && a.characters.edges.length > 0) withVoiceActors++;
  if (a.title && a.title.native) withJapaneseTitle++;
  if (a.episodes != null) {
    if (a.episodes < minEpisodes) minEpisodes = a.episodes;
    if (a.episodes > maxEpisodes) maxEpisodes = a.episodes;
  }
  if (a.popularity != null) {
    if (a.popularity < popularityRange[0]) popularityRange[0] = a.popularity;
    if (a.popularity > popularityRange[1]) popularityRange[1] = a.popularity;
  }
});

const mappedData = {
  meta: {
    totalEntries,
    genres: Array.from(genresSet),
    withVoiceActors,
    withJapaneseTitle,
    minEpisodes: isFinite(minEpisodes) ? minEpisodes : 0,
    maxEpisodes: isFinite(maxEpisodes) ? maxEpisodes : 0,
    popularityRange
  },
  anime
};

fs.writeFileSync(outputFile, JSON.stringify(mappedData, null, 2), "utf-8");
console.log(`✅ Mapping complete! Output saved to ${outputFile}`);
