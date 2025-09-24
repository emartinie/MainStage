// Example: Convert HomeGroupsMap.geojson to valid GeoJSON
fetch("HomeGroupsMap.geojson")
  .then(res => res.json())
  .then(data => {
    data.features.forEach(f => {
      if (f.properties.Coordinates) {
        const coords = f.properties.Coordinates.split(",").map(Number);
        f.geometry = {
          type: "Point",
          coordinates: [coords[0], coords[1]] // GeoJSON: [lon, lat]
        };
      }
    });
    // You can now save data as a new file or use it in Leaflet
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(console.error);