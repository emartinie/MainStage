// /js/resources/calendarResource.js
import { registerResource, getResource } from "/js/core/resourceManager.js";

function openCalendar() {
  const panel = getResource("calendar");
  if (!panel) return;

  panel.openCalendarPanel(
    "Prophecy Calendar",
    `<p> class="text-slate-300">Prophecy Calendar coming online 🌱</p>`
  );
}

registerResource("calendar", {
  open: openCalendar
});