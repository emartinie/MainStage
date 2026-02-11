console.log("🙏 prayerStore.dev.js loaded");

import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

export function listenForPrayers(callback) {
  const prayersCol = collection(db, "prayers");
  const requestsCol = collection(db, "requests");
  console.log("👂 Listening for prayers and requests in Firestore…");

  onSnapshot(prayersCol, requestsCol, snapshot => {
    console.log("📥 Firestore snapshot:", snapshot.size);
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const prayer = change.doc.data();
        const request = change.doc.data();
        console.log("🙏 New request or prayer received:", prayer, request);
        callback(prayer, request);
      }
    });
  });
}