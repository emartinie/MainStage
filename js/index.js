// index.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = 'https://api.scripture.api.bible/v1'; // example base

async function getChapterText(bookId, chapter) {
  const url = ${BASE_URL}/bibles/TLV/books/${bookId}/chapters/${chapter};
  const res = await fetch(url, {
    headers: { 'api-key': API_KEY }
  });
  const data = await res.json();
  return data.data.content; // or whatever the API returns
}
