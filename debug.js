// debug.js

// Toggle this flag to enable/disable logging everywhere
window.DEBUG_MODE = true;

(function () {
  const styles = {
    info: "color:#2563eb;font-weight:bold",      // blue
    success: "color:#16a34a;font-weight:bold",   // green
    warn: "color:#d97706;font-weight:bold",      // orange
    error: "color:#dc2626;font-weight:bold"      // red
  };

  window.log = {
    info: (...args) => window.DEBUG_MODE && console.log("%c[INFO]", styles.info, ...args),
    success: (...args) => window.DEBUG_MODE && console.log("%c[SUCCESS]", styles.success, ...args),
    warn: (...args) => window.DEBUG_MODE && console.warn("%c[WARN]", styles.warn, ...args),
    error: (...args) => window.DEBUG_MODE && console.error("%c[ERROR]", styles.error, ...args),
  };
})();