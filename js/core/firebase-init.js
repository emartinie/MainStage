console.log("🔥 firebase-init.js loading");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNYsljwgrRaJNycyNivNUbY6DPteYNyag",
  authDomain: "prayermap-669fc.firebaseapp.com",
  projectId: "prayermap-669fc",
  storageBucket: "prayermap-669fc.appspot.com",
  messagingSenderId: "887582168434",
  appId: "1:887582168434:web:2bccf2d4e1b9e79721f9eb"
};

const app = initializeApp(firebaseConfig);
window.db = getFirestore(app);

console.log("🔥 Firebase initialized");