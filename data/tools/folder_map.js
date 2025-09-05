const fs = require("fs");
const path = require("path");

// ✅ Update this with your Google Drive mapped folder
const ROOT_DIR = "G:/My Drive/Preparedness";
const OUTPUT_FILE = path.join(__dirname, "folder_map.json");

// Limit number of files per folder for preview runs
const MAX_FILES = 20;

let totalFolders = 0;
let totalFiles = 0;
let totalSize = 0;
let earliestDate = null;
let latestDate = null;

function buildFolderMap(dirPath) {
  let map = {
    path: dirPath,
    folders: [],
    files: []
  };

  try {
    console.log("📂 Scanning:", dirPath);

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    let fileCount = 0;

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        totalFolders++;
        map.folders.push(buildFolderMap(fullPath));
      } else {
        totalFiles++;
        try {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;

          const modDate = stats.mtime;
          if (!earliestDate || modDate < earliestDate) earliestDate = modDate;
          if (!latestDate || modDate > latestDate) latestDate = modDate;

        } catch (err) {
          console.warn(`⚠️ Could not stat file ${fullPath}: ${err.message}`);
        }

        if (fileCount < MAX_FILES) {
          map.files.push(item.name);
          fileCount++;
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ Skipping folder ${dirPath}: ${err.message}`);
  }

  return map;
}

console.log("🚀 Starting scan at:", ROOT_DIR);
const folderMap = buildFolderMap(ROOT_DIR);

const summary = {
  rootPath: ROOT_DIR,
  totalFolders,
  totalFiles,
  maxFilesPerFolder: MAX_FILES,
  totalSize,
  earliest: earliestDate,
  latest: latestDate,
  generatedAt: new Date().toISOString()
};

const output = { summary, folderMap };

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`✅ Folder map saved to ${OUTPUT_FILE}`);
console.log(`📊 Summary: ${totalFiles} files, ${totalFolders} folders, total size ${totalSize} bytes`);
