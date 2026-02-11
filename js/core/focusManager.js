// /js/core/focusManager.js
// Purpose: Track which resource is currently in focus

let currentFocus = null;
const focusStack = [];

/**
 * Set the active focus
 * @param {string} name - resource name
 */
export function setFocus(name) {
  if (!name) return;
  if (currentFocus === name) return;

  console.log(`🎯 Focus change: ${currentFocus || "none"} → ${name}`);

  // Push previous focus onto stack if it exists
  if (currentFocus) focusStack.push(currentFocus);

  currentFocus = name;
}

/**
 * Get the currently focused resource
 * @returns {string|null}
 */
export function getFocus() {
  return currentFocus;
}

/**
 * Clear focus for a resource
 * If the cleared resource was focused, restore previous from stack
 * @param {string} name
 */
export function clearFocus(name) {
  if (!name) return;
  if (currentFocus !== name) return;

  console.log(`🧹 Clearing focus: ${name}`);

  currentFocus = focusStack.pop() || null;
  console.log(`🔥 Restored focus: ${currentFocus || "none"}`);
}

/**
 * Debug helper: dump current focus stack
 */
export function dumpFocus() {
  console.log("🧠 Focus stack:", [...focusStack]);
  console.log("🔥 Current focus:", currentFocus);
}