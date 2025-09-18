if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => console.log("Service Worker registered:", reg))
      .catch(err => console.error("SW registration failed:", err));
  });
}

let deferredPrompt = null;

// Capture the PWA install event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Prevent automatic prompt
    deferredPrompt = e;  // Save the event for later

    showInstallButton(); // Make the button visible
});

// Show the install button dynamically
function showInstallButton() {
    let btn = document.getElementById('installBtn');
    if (!btn) {
        // If button doesn't exist, create it
        btn = document.createElement('button');
        btn.id = 'installBtn';
        btn.className = 'px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 fixed top-4 right-4 z-50';
        btn.textContent = '📲 Install App';
        document.body.appendChild(btn);
    }

    btn.style.display = 'inline-block';

    btn.onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt(); // Show native prompt
        const choiceResult = await deferredPrompt.userChoice;
        console.log('PWA install choice:', choiceResult.outcome);
        deferredPrompt = null; // Clear it
        btn.style.display = 'none'; // Hide after install
    };
}

// Optional: Hide button if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    const btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
});