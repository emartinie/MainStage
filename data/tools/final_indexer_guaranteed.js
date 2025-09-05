// final_indexer_guaranteed.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const pdf = require('pdf-parse');

// --- CONFIGURATION ---
const ROOT_PATH = 'D:\Emergency Preparedness'; // root folder to scan
const OUTPUT_FILE = './flat_index.json';
const SCAN_ZIPS = true;
const FILE_TYPES = ['.pdf'];

// --- HELPER FUNCTIONS ---
function generateUniqueId(filePath) {
    return Buffer.from(filePath).toString('base64');
}

function getFileStats(filePath) {
    const stats = fs.statSync(filePath);
    return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
    };
}

async function extractPdfMetadataFromBuffer(buffer) {
    try {
        const data = await pdf(buffer);
        return {
            pdfTitle: data.info.Title || null,
            pdfAuthor: data.info.Author || null,
            pdfPages: data.numpages || null
        };
    } catch {
        return { pdfTitle: null, pdfAuthor: null, pdfPages: null };
    }
}

async function extractPdfMetadata(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        return await extractPdfMetadataFromBuffer(buffer);
    } catch {
        return { pdfTitle: null, pdfAuthor: null, pdfPages: null };
    }
}

// --- FOLDER MAP & SUMMARY ---
const folderMap = {}; 
const summary = {
    totalPDFs: 0,
    totalSize: 0,
    earliestModified: null,
    latestModified: null
};

function initializeFolderMap(folderPath) {
    const relFolder = path.relative(ROOT_PATH, folderPath) || '.';
    if (!folderMap[relFolder]) {
        folderMap[relFolder] = {
            path: relFolder,
            pdfCount: 0,
            totalSize: 0,
            earliestModified: null,
            latestModified: null
        };
    }
    return relFolder;
}

function updateFolderMap(filePath, size, modified) {
    const folderPath = initializeFolderMap(path.dirname(filePath));
    const folder = folderMap[folderPath];

    folder.pdfCount += 1;
    folder.totalSize += size;

    if (!folder.earliestModified || modified < folder.earliestModified)
        folder.earliestModified = modified;
    if (!folder.latestModified || modified > folder.latestModified)
        folder.latestModified = modified;
}

// --- SCAN FUNCTIONS ---
async function scanFolder(folderPath, basePath = folderPath) {
    let items = [];
    initializeFolderMap(folderPath);

    const files = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(folderPath, file.name);

        if (file.isDirectory()) {
            items = items.concat(await scanFolder(fullPath, basePath));
        } else if (FILE_TYPES.includes(path.extname(file.name).toLowerCase())) {
            const stats = getFileStats(fullPath);
            const pdfMeta = await extractPdfMetadata(fullPath);

            items.push({
                id: generateUniqueId(fullPath),
                name: file.name,
                path: path.relative(basePath, fullPath),
                type: path.extname(file.name).slice(1),
                source: basePath,
                size: stats.size,
                created: stats.created,
                modified: stats.modified,
                category: path.basename(path.dirname(fullPath)),
                ...pdfMeta
            });

            updateFolderMap(fullPath, stats.size, stats.modified);
        } else if (SCAN_ZIPS && path.extname(file.name).toLowerCase() === '.zip') {
            items = items.concat(await scanZip(fullPath, basePath));
        }
    }

    return items;
}

async function scanZip(zipPath, basePath) {
    const items = [];
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    for (const entry of zipEntries) {
        if (!entry.isDirectory && FILE_TYPES.includes(path.extname(entry.entryName).toLowerCase())) {
            const virtualPath = path.relative(basePath, `${zipPath}:${entry.entryName}`);
            let pdfMeta = { pdfTitle: null, pdfAuthor: null, pdfPages: null };

            try {
                const buffer = entry.getData();
                pdfMeta = await extractPdfMetadataFromBuffer(buffer);
            } catch { }

            items.push({
                id: generateUniqueId(virtualPath),
                name: path.basename(entry.entryName),
                path: virtualPath,
                type: path.extname(entry.entryName).slice(1),
                source: basePath,
                size: entry.header.size,
                created: null,
                modified: entry.header.time,
                category: path.basename(path.dirname(entry.entryName)),
                ...pdfMeta
            });

            updateFolderMap(`${zipPath}:${entry.entryName}`, entry.header.size, entry.header.time);
        }
    }

    return items;
}

// --- MAIN EXECUTION ---
(async () => {
    console.log('Scanning folders and PDFs (including inside zips)...');
    const allItems = await scanFolder(ROOT_PATH);

    // Aggregate folder stats for root-level summary
    Object.values(folderMap).forEach(f => {
        summary.totalPDFs += f.pdfCount;
        summary.totalSize += f.totalSize;
        if (f.earliestModified && (!summary.earliestModified || f.earliestModified < summary.earliestModified))
            summary.earliestModified = f.earliestModified;
        if (f.latestModified && (!summary.latestModified || f.latestModified > summary.latestModified))
            summary.latestModified = f.latestModified;
    });

    const output = {
        summary,
        folderMap,
        files: allItems
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Indexed ${allItems.length} files. Folder map and summary included. Output: ${OUTPUT_FILE}`);
})();
