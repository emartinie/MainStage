// indexer.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); // for scanning zip files

// --- CONFIGURATION ---
const ROOT_PATH = 'D:\Emergency Preparedness'; // <-- set your source folder here
const OUTPUT_FILE = './flat_index.json';
const SCAN_ZIPS = true; // set false if you don't want to scan zip contents
const FILE_TYPES = ['.pdf']; // extend as needed

// --- HELPER FUNCTIONS ---
function generateUniqueId(filePath) {
    return Buffer.from(filePath).toString('base64'); // simple unique ID
}

function scanFolder(folderPath, basePath = folderPath) {
    const items = [];
    const files = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(folderPath, file.name);

        if (file.isDirectory()) {
            items.push(...scanFolder(fullPath, basePath));
        } else if (FILE_TYPES.includes(path.extname(file.name).toLowerCase())) {
            items.push({
                id: generateUniqueId(fullPath),
                name: file.name,
                path: path.relative(basePath, fullPath),
                type: path.extname(file.name).slice(1),
                source: basePath,
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
            });
        }
    });

    return items;
}

// --- MAIN ---
const allItems = scanFolder(ROOT_PATH);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allItems, null, 2));
console.log(`Indexed ${allItems.length} files. Output: ${OUTPUT_FILE}`);
