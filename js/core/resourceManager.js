// /js/core/resourceManager.js
// Purpose: Central lifecycle manager for app subsystems (player, journey, panels, etc)

const resources = new Map();

/**
 * Register a resource with init and destroy handlers
 * @param {string} name
 * @param {{ init?: Function, destroy?: Function }} handlers
 */
export function registerResource(name, { init, destroy } = {}) {
  if (!name) throw new Error("Resource must have a name");

  if (resources.has(name)) {
    console.warn(`⚠ Resource "${name}" already registered`);
    return;
  }

  resources.set(name, {
    name,
    init: typeof init === "function" ? init : null,
    destroy: typeof destroy === "function" ? destroy : null,
    active: false
  });

  console.log(`📦 Resource registered: ${name}`);
}

/**
 * Activate a resource by name
 */
export function activateResource(name) {
  const res = resources.get(name);
  if (!res) {
    console.warn(`⚠ Resource not found: ${name}`);
    return;
  }

  if (res.active) {
    console.warn(`⚠ Resource already active: ${name}`);
    return;
  }

  try {
    res.init?.();
    res.active = true;
    console.log(`▶ Resource activated: ${name}`);
  } catch (err) {
    console.error(`❌ Failed to init resource "${name}", err`);
  }
}

/**
 * Deactivate a resource by name
 */
export function deactivateResource(name) {
  const res = resources.get(name);
  if (!res) return;
  if (!res.active) return;

  try {
    res.destroy?.();
    res.active = false;
    console.log(`⏹ Resource deactivated: ${name}`);
  } catch (err) {
    console.error(`❌ Failed to destroy resource "${name}", err`);
  }
}

/**
 * Deactivate all active resources
 */
export function deactivateAllResources() {
  for (const name of resources.keys()) {
    deactivateResource(name);
  }
}

/**
 * Get snapshot of resource state (for debugger)
 */
export function getResourceState() {
  return Array.from(resources.values()).map(r => ({
    name: r.name,
    active: r.active
  }));
}

/**
 * Check if resource is active
 */
export function isResourceActive(name) {
  return resources.get(name)?.active === true;
}

/**
 * Debug helper
 */
export function dumpResources() {
  console.table(getResourceState());
}