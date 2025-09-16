// bibleApi.js
import fetch from "node-fetch";  // if Node.js
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1";

// Generic fetch helper
async function bibleFetch(endpoint) {
  const res = await fetch(${BASE_URL}${endpoint}, {
    headers: { "api-key": API_KEY }
  });
  if (!res.ok) throw new Error(API error: ${res.status});
  return res.json();
}

// ===============================
// 📚 Core API Helpers
// ===============================

// 1. List all available Bibles (translations, incl. TLV)
export async function getBibles() {
  return bibleFetch("/bibles");
}

// 2. Get metadata for one Bible
export async function getBible(bibleId) {
  return bibleFetch(/bibles/${bibleId});
}

// 3. Get all books of a Bible
export async function getBooks(bibleId) {
  return bibleFetch(/bibles/${bibleId}/books);
}

// 4. Get all chapters of a book
export async function getChapters(bibleId, bookId) {
  return bibleFetch(/bibles/${bibleId}/books/${bookId}/chapters);
}

// 5. Get all verses in a chapter
export async function getChapter(bibleId, chapterId) {
  return bibleFetch(/bibles/${bibleId}/chapters/${chapterId});
}

// 6. Get a passage by range
export async function getPassage(bibleId, passageId) {
  return bibleFetch(/bibles/${bibleId}/passages/${passageId});
}

// 7. Get a single verse
export async function getVerse(bibleId, verseId) {
  return bibleFetch(/bibles/${bibleId}/verses/${verseId});
}

// 8. Search Bible text
export async function searchBible(bibleId, query) {
  return bibleFetch(/bibles/${bibleId}/search?query=${encodeURIComponent(query)});
}

// ===============================
// 🎯 Example usage
// ===============================

// TLV Bible ID (you’ll find it by running getBibles())
// Let’s pretend TLV = "abcd1234" (replace w/ real ID later)
const TLV_ID = "abcd1234";

async function demo() {
  try {
    console.log("Listing Bibles...");
    const bibles = await getBibles();
    console.log(bibles);

    console.log("Fetching John 3:16 (TLV)...");
    const verse = await getVerse(TLV_ID, "JHN.3.16");
    console.log(verse);

    console.log("Searching for 'Messiah' in TLV...");
    const search = await searchBible(TLV_ID, "Messiah");
    console.log(search);
  } catch (err) {
    console.error(err);
  }
}

demo();
Sent
