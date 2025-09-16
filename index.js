// index.js

const apiKey = 'process.env.API_KEY';
console.log(apiKey);


import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = 'process.env.API_KEY';
const BASE_URL = 'https://api.scripture.api.bible/v1'; // example base

async function getChapterText(bookId, chapter) {
  const url = '${BASE_URL}/bibles/${bookId}/chapters/${chapter}';
  const res = await fetch(url, {
    headers: { 'api-key': API_KEY }
  });
  const data = await res.json();
  return data.data.content; // or whatever the API returns
}
