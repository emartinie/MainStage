// prayerButton.dev.js



import { db } from "./firebase-init.dev.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("🙏 prayerButton.dev.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("prayerButton");
  const form = document.getElementById("prayerOverlay");

  if (!btn) {
    console.warn("⚠️ prayerButton not found in DOM");
    return;
  }
  if (!form) {
    console.warn("⚠️ prayerForm not found in DOM");
    return;
  }

  console.log("✅ prayerButton and prayerForm Overlay found");

  // Open the form when button clicked
  btn.addEventListener("click", () => {
    form.classList.remove("hidden");
    console.log("🟢 Prayer Overlay form opened");
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prayer = {
      name: form.querySelector("#prayerName")?.value || "",
      city: form.querySelector("#prayerCity")?.value || "",
      message: form.querySelector("#prayerMessage")?.value || "",
      coordinates: [-98.35, 39.5], // temp known-good coordinates; can later grab map center if needed
      createdAt: serverTimestamp()
    };

    console.log("🙏 Prayer form submitted:", prayer);

    try {
      const ref = await addDoc(collection(db, "prayers"), prayer);
      console.log("🔥 Prayer sent to Firestore with ID:", ref.id);
      //form.reset();
      form.classList.add("hidden");
      console.log("✅ Form reset and hidden after submission");
    } catch (err) {
      console.error("❌ Failed to send prayer:", err);
    }
  });
});