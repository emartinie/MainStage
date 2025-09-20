const fs = require("fs");
const path = require("path");

function flatten(node, currentPath = "", startId = { value: 1 }) {
  let files = [];

  const folderPath = path.join(currentPath, node.name);

  // Add PDF files in this folder
  if (node.files) {
    for (const file of node.files) {
      const ext = path.extname(file.name).toLowerCase();
      if (ext === ".pdf") {
        const fullPath = path.join(folderPath, file.name);
        const entryStats = fs.statSync(fullPath);

        files.push({
          id: startId.value++, // unique reference ID
          path: fullPath.replace(/\\/g, "/"),
          name: file.name,
          ext: "pdf",
          size: file.size,
          category: folderPath.replace(/\\/g, "/"), // folder structure only
          created: entryStats.birthtime, // file creation time
          modified: entryStats.mtime     // last modified time
        });
      }
    }
  }

  // Recurse into subfolders
  if (node.folders) {
    for (const folder of node.folders) {
      files = files.concat(flatten(folder, folderPath, startId));
    }
  }

  return files;
}

// Load your hierarchical index
const tree = JSON.parse(fs.readFileSync("folder_index.json", "utf8"));

// Flatten it, filter PDFs, and assign IDs
const flatIndex = flatten(tree);

// Save as flat_index.json
fs.writeFileSync("flat_index.json", JSON.stringify(flatIndex, null, 2));
console.log(`✅ Flattened index saved to flat_index.json with ${flatIndex.length} PDFs`);
