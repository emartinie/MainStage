import { registerResource, getResource } from "/js/core/resourceManager.js";

function openHtmlPanel(url, title = "Content") {
  const panel = getResource("porchPanel");
  if (!panel) {
    console.warn("PorchPanel not ready");
    return;
  }

  const iframeHtml = `
    <div class="w-full h-full">
      <iframe
        src="${url}"
        class="w-full h-[70vh] rounded-lg border border-slate-700"
        loading="lazy"
      ></iframe>
    </div>
  `;

  panel.openPorchPanel(title, iframeHtml);
}

registerResource("htmlPanel", {
  open: openHtmlPanel
});