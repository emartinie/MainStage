// aniListTop500.js
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const outputFile = "anime_full.json";
const PAGE_SIZE = 50; // AniList API pagination limit
const TOTAL = 500; // top 500 entries

const query = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: POPULARITY_DESC, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      episodes
      format
      genres
      averageScore
      popularity
      coverImage {
        large
      }
      characters(sort: FAVOURITES_DESC, perPage: 5) {
        edges {
          role
          node {
            name {
              full
            }
            image {
              medium
            }
          }
          voiceActors(language: JAPANESE) {
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
    }
  }
}
`;

async function fetchAniListPage(page) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { page, perPage: PAGE_SIZE } }),
  });
  const data = await res.json();
  return data.data.Page.media;
}

(async () => {
  let allAnime = [];
  let pages = Math.ceil(TOTAL / PAGE_SIZE);

  for (let i = 1; i <= pages; i++) {
    console.log(`Fetching page ${i}/${pages}...`);
    const pageData = await fetchAniListPage(i);
    allAnime = allAnime.concat(pageData);
  }

  // Trim to TOTAL in case last page exceeds limit
  allAnime = allAnime.slice(0, TOTAL);

  fs.writeFileSync(outputFile, JSON.stringify(allAnime, null, 2), "utf-8");
  console.log(`✅ Saved ${allAnime.length} anime to ${outputFile}`);
})();
