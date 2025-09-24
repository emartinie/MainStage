const fs = require("fs");

// Input + output file names
const inputFile = "HomeGroupsMap.geojson";
const outputFile = "HomeGroupsMap_fixed.geojson";

// Read the file
const raw = fs.readFileSync(inputFile, "utf8");
const geojson = JSON.parse(raw);

// Walk features
geojson.features = geojson.features.map((f, idx) => {
  try {
    if (!f.geometry && f.properties?.Coordinates) {
      const coords = f.properties.Coordinates.split(",").map(Number);
      if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        f.geometry = {
          type: "Point",
          coordinates: [coords[0], coords[1]] // [lon, lat]
        };
      } else {
        console.warn(⚠️ Feature ${idx} had bad coords: ${f.properties.Coordinates});
      }
    }
  } catch (e) {
    console.warn(⚠️ Failed at feature ${idx}, e.message);
  }
  return f;
});

// Write output
fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
console.log(✅ Fixed file written: ${outputFile});