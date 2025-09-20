// full_indexer_with_zip_pdf_metadata.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const pdf = require('pdf-parse');

// --- CONFIGURATION ---
const ROOT_PATH = './source';
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
    } catch (err) {
        return {
            pdfTitle: null,
            pdfAuthor: null,
            pdfPages: null
        };
    }
}

async function extractPdfMetadata(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        return await extractPdfMetadataFromBuffer(buffer);
    } catch (err) {
        return {
            pdfTitle: null,
            pdfAuthor: null,
            pdfPages: null
        };
    }
}

async function scanFolder(folderPath, basePath = folderPath) {
    let items = [];
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
