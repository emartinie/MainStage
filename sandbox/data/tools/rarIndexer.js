const fs = require('fs');
const path = require('path');
const Unrar = require('node-unrar-js'); // make sure installed via npm

const inputFolder = 'G:/My Drive/Preparedness'; // folder with RARs
const outputJSON = 'rar_index.json';

async function listRarFiles(rarPath) {
    const data = fs.readFileSync(rarPath);
    const extractor = Unrar.createExtractorFromData(data);
    const list = extractor.getFileList();
    if (list[0].state === "SUCCESS") {
        return list[1].fileHeaders.map(f => ({
            name: f.name,
            size: f.uncompressedSize,
            date: f.mtime
        }));
    }
    return [];
}

function walkFolder(folder) {
    let results = [];
    const entries = fs.readdirSync(folder, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(folder, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(walkFolder(fullPath));
        } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.rar') {
            results.push({ archive: entry.name, path: folder });
        }
    }
    return results;
}

async function buildRarIndex() {
    const rarFiles = walkFolder(inputFolder);
    const index = [];
    for (const rar of rarFiles) {
        console.log(`Processing ${rar.archive} ...`);
        const files = await listRarFiles(path.join(rar.path, rar.archive));
        index.push({ ...rar, files });
    }
    fs.writeFileSync(outputJSON, JSON.stringify(index, null, 2));
    console.log(`✅ RAR index saved to ${outputJSON}`);
}

buildRarIndex().catch(err => console.error(err));
