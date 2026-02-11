// /js/resources/studyHubResource.js
import { registerResource, getResource } from "/js/core/resourceManager.js";

function openStudyHub() {
  const panel = getResource("porchPanel");
  if (!panel) return;

  panel.openPorchPanel(
    "Study Hub",
    `<p> class="text-slate-300">Study Hub coming online 🌱</p>`
  );
}

registerResource("studyHub", {
  open: openStudyHub
});