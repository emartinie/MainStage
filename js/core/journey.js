import { registerResource } from "./core/resourceManager.js";

function initJourney() { ... }
function destroyJourney() { ... }

registerResource("journey", {
  init: initJourney,
  destroy: destroyJourney
});