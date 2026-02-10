console.log("🙏 prayerStore.dev.js loaded");

import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

export function listenForPrayers(callback) {
  const prayersCol = collection(db, "prayers");
  console.log("👂 Listening for prayers in Firestore…");

  onSnapshot(prayersCol, snapshot => {
    console.log("📥 Firestore snapshot:", snapshot.size);
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const prayer = change.doc.data();
        console.log("🙏 New prayer received:", prayer);
        callback(prayer);
      }
    });
  });
}