// /js/core/resourceManager.js

const resources = new Map();

export function registerResource(name, handlers = {}) {
  if (!name) throw new Error("Resource must have a name");

  if (resources.has(name)) {
    console.warn(`⚠ Resource "${name}" already registered`);
    return;
  }

  const { init, destroy, ...extra } = handlers;

  resources.set(name, {
    name,
    init: typeof init === "function" ? init : null,
    destroy: typeof destroy === "function" ? destroy : null,
    active: false,
    ...extra
  });

  console.log(`📦 Resource registered: ${name}`);
}

export function activateResource(name) {
  const res = resources.get(name);

  if (!res) {
    console.warn(`⚠ Resource not found: ${name}`);
    return;
  }

  if (res.active) return;

  try {
    res.init?.();
    res.active = true;
    console.log(`▶ Resource activated: ${name}`);
  } catch (err) {
    console.error(`❌ Failed to init resource "${name}", err`);
  }
}

export function deactivateResource(name) {
  const res = resources.get(name);
  if (!res || !res.active) return;

  try {
    res.destroy?.();
    res.active = false;
    console.log(`⏹ Resource deactivated: ${name}`);
  } catch (err) {
    console.error(`❌ Failed to destroy resource "${name}", err`);
  }
}

export function deactivateAllResources() {
  for (const name of resources.keys()) {
    deactivateResource(name);
  }
}

export function getResource(name) {
  return resources.get(name);
}

export function isResourceActive(name) {
  return resources.get(name)?.active === true;
}

export function getResourceState() {
  return Array.from(resources.values()).map(r => ({
    name: r.name,
    active: r.active
  }));
}

export function dumpResources() {
  console.table(getResourceState());
}

window.dumpResources = dumpResources;
window.getResource = getResource; // this is also very useful in console