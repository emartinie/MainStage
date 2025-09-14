// curriculum_indexer.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); // for scanning zip files
const pdf = require('pdf-parse'); // optional, if you want PDF metadata

// --- CONFIGURATION ---
// Option 2: Forward slashes (works on Windows)
const ROOT_PATH = 'E:/Emergency Preparedness/General/StudentBibleCurriculum';
const OUTPUT_FILE = './curriculum_index.json';
const SCAN_ZIPS = true; // set false to skip zip scanning
const FILE_TYPES = ['.pdf', '.docx']; // extend if needed

// --- HELPER FUNCTIONS ---
function generateUniqueId(filePath) {
    return Buffer.from(filePath.replace(/\\/g, '/')).toString('base64'); // simple unique ID
}

function getFileStats(filePath) {
    const stats = fs.statSync(filePath);
    return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
    };
}

function scanFolder(folderPath, basePath = folderPath) {
    const items = [];
    const files = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(folderPath, file.name);

        if (file.isDirectory()) {
            items.push(...scanFolder(fullPath, basePath));
        } else if (FILE_TYPES.includes(path.extname(file.name).toLowerCase())) {
            const stats = getFileStats(fullPath);
            items.push({
                id: generateUniqueId(fullPath),
                name: file.name,
                path: path.relative(basePath, fullPath),
                type: path.extname(file.name).slice(1),
                source: basePath,
                size: stats.size,
                created: stats.created,
                modified: stats.modified,
                category: path.basename(path.dirname(fullPath)), // simple folder-based category
            });
        } else if (SCAN_ZIPS && path.extname(file.name).toLowerCase() === '.zip') {
            items.push(...scanZip(fullPath, basePath));
        }
    }

    return items;
}

function scanZip(zipPath, basePath) {
    const items = [];
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    zipEntries.forEach(entry => {
        if (!entry.isDirectory && FILE_TYPES.includes(path.extname(entry.entryName).toLowerCase())) {
            const virtualPath = path.relative(basePath, `${zipPath}:${entry.entryName}`);
            items.push({
                id: generateUniqueId(virtualPath),
                name: path.basename(entry.entryName),
                path: virtualPath,
                type: path.extname(entry.entryName).slice(1),
                source: basePath,
                size: entry.header.size,
                created: null, // zip entries don’t have reliable timestamps
                modified: entry.header.time,
                category: path.basename(path.dirname(entry.entryName)),
            });
        }
    });

    return items;
}

// Limit number of files per folder for preview runs or MAX_FILES = Infinity
const MAX_FILES = Infinity;

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

// --- MAIN ---
console.log('Scanning, this may take a while for large folders...');
const allItems = scanFolder(ROOT_PATH);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allItems, null, 2));
console.log(`Indexed ${allItems.length} files. Output: ${OUTPUT_FILE}`);
