// curriculum_indexer.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');       // for scanning zip files
const pdfParse = require('pdf-parse');   // for PDF metadata

// --- CONFIGURATION ---
const ROOT_PATH = 'E:/Emergency Preparedness/General/StudentBibleCurriculum'; // Windows-friendly
const OUTPUT_FILE = './curriculum_index.json';
const SCAN_ZIPS = true;
const FILE_TYPES = ['.pdf', '.docx']; // include Word docs

// --- HELPER FUNCTIONS ---
function generateUniqueId(filePath) {
    return Buffer.from(filePath.replace(/\\/g, '/')).toString('base64'); // normalize slashes
}

function getFileStats(filePath) {
    const stats = fs.statSync(filePath);
    return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
    };
}

// Extract PDF metadata asynchronously
async function getPdfMetadata(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return {
            numPages: data.numpages || null,
            info: data.info || null,
            textSnippet: data.text ? data.text.substring(0, 200) : null // optional snippet
        };
    } catch (err) {
        console.warn(`⚠️ Could not read PDF metadata for ${filePath}: ${err.message}`);
        return {};
    }
}

// --- SCAN FUNCTIONS ---
async function scanFolder(folderPath, basePath = folderPath) {
    const items = [];
    const files = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(folderPath, file.name);

        if (file.isDirectory()) {
            items.push(...await scanFolder(fullPath, basePath));
        } else {
            const ext = path.extname(file.name).toLowerCase();

            if (FILE_TYPES.includes(ext)) {
                const stats = getFileStats(fullPath);
                let pdfMeta = {};
                if (ext === '.pdf') pdfMeta = await getPdfMetadata(fullPath);

                items.push({
                    id: generateUniqueId(fullPath),
                    name: file.name,
                    path: path.relative(basePath, fullPath),
                    type: ext === '.pdf' ? 'PDF' : 'Word',
                    source: basePath,
                    ...stats,
                    ...pdfMeta,
                    category: path.basename(path.dirname(fullPath))
                });
            } else if (SCAN_ZIPS && ext === '.zip') {
                items.push(...await scanZip(fullPath, basePath));
            }
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
            });
        }
    }

    return items;
}

// --- MAIN ---
(async () => {
    console.log('📂 Scanning, this may take a while...');
    const allItems = await scanFolder(ROOT_PATH);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allItems, null, 2));
    console.log(`✅ Indexed ${allItems.length} files. Output saved to ${OUTPUT_FILE}`);
})();
