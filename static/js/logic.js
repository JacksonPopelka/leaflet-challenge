let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let earthquakeMap = L.map('map', {
  center: [40.7606, -111.8881],
  zoom: 5
});

baseLayer.addTo(earthquakeMap);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (quakeData) {
  function styleDetails(feature) {
    return {
      opacity: 1,
      fillOpacity: 0.7,
      fillColor: chooseColor(feature.geometry.coordinates[2]),
      color: 'gray',
      radius: scaleRadius(feature.properties.mag),
      stroke: true,
      weight: 0.4
    };
  }

  function chooseColor(depth) {
    return depth > 90 ? "#8B0000" :
           depth > 70 ? "#FF4500" :
           depth > 50 ? "#FFA500" :
           depth > 30 ? "#FFFF00" :
           depth > 10 ? "#ADFF2F" :
                        "#00FA9A";
  }

  function scaleRadius(magnitude) {
    return magnitude <= 1 ? 2.5 : magnitude * 3.2;
  }

  L.geoJson(quakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleDetails,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        'Magnitude: ' + feature.properties.mag +
        '<br>Location: ' + feature.properties.place +
        '<br>Depth: ' + feature.geometry.coordinates[2] + ' km'
      );
    }
  }).addTo(earthquakeMap);

  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "legend-box");
    let levels = [0, 10, 30, 50, 70, 90];
    div.innerHTML += "<h3>Depth Legend</h3><h4>(km)</h4>";
    for (let i = 0; i < levels.length; i++) {
      div.innerHTML +=
        '<i style="background:' + chooseColor(levels[i] + 1) + '"></i> ' +
        levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(earthquakeMap);
});
