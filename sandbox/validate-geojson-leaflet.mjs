import fs from 'fs';

// Path to your GeoJSON file
const filePath = './HomeGroupsMap.geojson';

try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  if (!data.type || data.type !== 'FeatureCollection') {
    console.error('This is not a valid FeatureCollection GeoJSON.');
    process.exit(1);
  }

  const features = data.features || [];
  console.log(Total features in file: ${features.length});

  // Validate each feature for Leaflet requirements
  let validCount = 0;
  let missingCoords = 0;

  features.forEach((feature, idx) => {
    const coords = feature.geometry?.coordinates || feature.properties?.Coordinates;
    if (!coords) {
      missingCoords++;
      console.warn(Feature ${idx} is missing coordinates and will be skipped.);
    } else {
      validCount++;
    }
  });

  console.log(Features with valid coordinates: ${validCount});
  console.log(Features missing coordinates: ${missingCoords});
} catch (err) {
  console.error('Error reading or parsing GeoJSON:', err);
}