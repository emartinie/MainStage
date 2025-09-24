// Force Node into CommonJS mode by using .js and no "type":"module" in package.json
const fs = require("fs");

const inputFile = "HomeGroupsMap.geojson";
const outputFile = "HomeGroupsMap_fixed.geojson";

const raw = fs.readFileSync(inputFile, "utf8");
const geojson = JSON.parse(raw);

geojson.features = geojson.features.map((f, idx) => {
  if (!f.geometry && f.properties?.Coordinates) {
    const parts = f.properties.Coordinates.split(",").map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      f.geometry = {
        type: "Point",
        coordinates: [parts[0], parts[1]] // [lon, lat]
      };
    } else {
      console.warn(⚠️ Bad coords at feature ${idx}: ${f.properties.Coordinates});
    }
  }
  return f;
});

fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
console.log(✅ Fixed file written: ${outputFile});