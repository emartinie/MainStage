// /js/resources/articleResource.js
import { registerResource, getResource } from "/js/core/resourceManager.js";

function openArticles() {
  const panel = getResource("articles");
  if (!panel) return;

  panel.openArticles(
    "Articles",
    `<p> class="text-slate-300">Articles coming online 🌱</p>`
  );
}

registerResource("articles", {
  open: openArticles
});