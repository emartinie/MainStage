// full_indexer.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); // for scanning zip files
const pdf = require('pdf-parse'); // optional, if you want PDF metadata

// --- CONFIGURATION ---
const ROOT_PATH = 'D:\Emergency Preparedness'; // root folder or zip folder
const OUTPUT_FILE = './flat_index.json';
const SCAN_ZIPS = true; // set false to skip zip scanning
const FILE_TYPES = ['.pdf']; // extend if needed

// --- HELPER FUNCTIONS ---
function generateUniqueId(filePath) {
    return Buffer.from(filePath).toString('base64'); // simple unique ID
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

// --- MAIN ---
console.log('Scanning, this may take a while for large folders...');
const allItems = scanFolder(ROOT_PATH);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allItems, null, 2));
console.log(`Indexed ${allItems.length} files. Output: ${OUTPUT_FILE}`);
