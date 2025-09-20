const fs = require("fs");
const path = require("path");

function scanDir(dir) {
  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) return null;

  const result = {
    name: path.basename(dir),
    folders: [],
    files: []
  };

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const entryStats = fs.statSync(fullPath);

    if (entryStats.isDirectory()) {
      result.folders.push(scanDir(fullPath));
    } else {
      result.files.push({
        name: entry,
        size: entryStats.size
      });
    }
  }
  return result;
}

// 👇 Change this path to point to your unzipped folder
const rootPath = "D:\Emergency Preparedness";

// Scan folder and build JSON index
const output = scanDir(rootPath);

// Save result
fs.writeFileSync("folder_index.json", JSON.stringify(output, null, 2));

console.log("✅ Inventory saved to folder_index.json");
