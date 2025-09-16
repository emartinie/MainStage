// index2.js
const apiKey = 'process.env.API_KEY';
console.log(apiKey);
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.scripture.api.bible/v1';

// Helper for GET requests
async function apiGet(path) {
  const url = '${BASE_URL}${path}';
  try {
    const res = await fetch(url, {
      headers: { 'api-key': process.env.API_KEY }
    });
    if (!res.ok) throw new Error(API Error: ${res.status} ${res.statusText});
    return await res.json();
  } catch (err) {
    console.error(err.message);
    return null;
  }
}

// Example calls
async function testApi() {
  // 1. Get available Bibles
  const bibles = await apiGet('/bibles');
  console.log('Available Bibles:', bibles?.data?.map(b => b.name));

  // 2. Get books for TLV Bible (replace with your Bible ID)
  const bibleId = 'de4e12af7f28f599-02'; // TLV example
  const books = 'await apiGet(/bibles/${bibleId}/books)';
  console.log('Books:', books?.data?.map(b => b.name));

  // 3. Get chapters for the first book
  const firstBookId = 'books?.data?.[0]?.id';
  if (firstBookId) {
    const chapters = 'await apiGet(/bibles/${bibleId}/books/${firstBookId}/chapters)';
    console.log('Chapters:', chapters?.data?.map(c => c.reference));
  }

  // 4. Get verses for first chapter of first book
  const firstChapterId = 'chapters?.data?.[0]?.id';
  if (firstChapterId) {
    const verses = 'await apiGet(/bibles/${bibleId}/chapters/${firstChapterId}/verses)';
    console.log('Verses sample:', verses?.data?.slice(0,5));
  }
}

testApi();