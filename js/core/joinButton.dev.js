// joinButton.dev.js

import { db } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("🙏 joinButton.dev.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("joinButton");
  const form = document.getElementById("joinOverlay");

  if (!btn) {
    console.warn("⚠️ joinButton not found in DOM");
    return;
  }
  if (!form) {
    console.warn("⚠️ joinForm not found in DOM");
    return;
  }

  console.log("✅ joinButton and joinForm Overlay found");

  // Open the form when button clicked
  btn.addEventListener("click", () => {
    form.classList.remove("hidden");
    console.log("🟢 Join Overlay form opened");
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const request = {
      name: form.querySelector("#joinName")?.value || "",
      city: form.querySelector("#joinCity")?.value || "",
      message: form.querySelector("#joinMessage")?.value || "",
      coordinates: [-98.35, 39.5], // temp known-good coordinates; can later grab map center if needed
      createdAt: serverTimestamp()
    };

    console.log("🙏 Join form submitted:", request);

    try {
      const ref = await addDoc(collection(db, "requests"), request);
      console.log("🔥 Join Request sent to Firestore with ID:", ref.id);
      //form.reset();
      form.classList.add("hidden");
      console.log("✅ Form reset and hidden after submission");
    } catch (err) {
      console.error("❌ Failed to send join request:", err);
    }
  });
});