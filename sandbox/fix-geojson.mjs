import fs from "fs";

// Input and output files
const inputFile = "./HomeGroupsMap.geojson";
const outputFile = "./HomeGroupsMap_fixed.geojson";

// Read file
const rawData = fs.readFileSync(inputFile, "utf8");
const geojson = JSON.parse(rawData);

// Process features
const fixedFeatures = geojson.features
  .map((feature, idx) => {
    const coordsStr = feature.properties?.Coordinates;
    if (!coordsStr) {
      console.warn(feature ${idx} missing coords, skipping);
      return null;
    }

    const parts = coordsStr.split(",").map(s => parseFloat(s.trim()));
    if (parts.length < 2 || parts.some(isNaN)) {
      console.warn(feature ${idx} has invalid coords, skipping);
      return null;
    }

    feature.geometry = {
      type: "Point",
      coordinates: [parts[0], parts[1]]
    };
    return feature;
  })
  .filter(f => f !== null);

// Write fixed GeoJSON
const fixedGeojson = {
  type: "FeatureCollection",
  name: geojson.name || "HomeGroupsMap",
  crs: geojson.crs || { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: fixedFeatures
};

fs.writeFileSync(outputFile, JSON.stringify(fixedGeojson, null, 2), "utf8");

console.log(Fixed GeoJSON saved to ${outputFile}. ${fixedFeatures.length} features ready.);