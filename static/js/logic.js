// Initialize the map and set its view
let myMap = L.map("map", {
    center: [40.758701, -111.876183], 
    zoom: 5,
    fillOpacity : 1
});

// Add a tile layer (basemap) to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

// Function to determine the color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF5f65' :
           depth > 70 ? '#fca35d' :
           depth > 50 ? '#fdb72a' :
           depth > 30 ? '#f7db11' :
           depth > 10 ? '#dcf400' :
                         '#a3f600';
}

//Create a legend to display colour information about the map
let legend = L.control({position:"bottomright"});

legend.onAdd = function(map){
    let div = L.DomUtil.create('div', 'info legend');
       
    // Add a white background and some padding to the legend
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.boxShadow =  '0 0 15px rgba(0, 0, 0, 0.3)';

    let grades = [-10, 10, 30, 50, 70, 90];
    let labels = [];
    let from, to;

    // Loop through the depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
        from = grades [i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '; width: 14px; height: 14px; display: inline-block; margin-right: 8px;"></i> ' +
            from + (to ? '&ndash;' + to : '+')
        );
    }
        
    div.innerHTML =labels.join('<br>');
    return div;
};

// Add the legend to the map
legend.addTo(myMap);

function createFeatures(earthquakeData) {
    // Arrays to hold the created earthquake markers
    let earthquakeMarkers = [];
    
    // Loop through the earthquakeData, and create the magnitude and depth markers.
    earthquakeData.forEach(function(feature) {
        let longitude = feature.geometry.coordinates[0];
        let latitude = feature.geometry.coordinates[1];
        let depth = feature.geometry.coordinates[2];
        let magnitude = feature.properties.mag;

        // Create a circle marker with color based on depth
        earthquakeMarkers.push(
            L.circle([latitude, longitude], {
                stroke : true,
                color: "black",
                weight: 0.2,
                fillOpacity: 1,
                fillColor: getColor(depth),
                radius: magnitude * 10000
            }).bindPopup(`<h3>Magnitude: ${magnitude}</h3><hr><p>Depth: ${depth} km</p><hr><p>Longitute, Latitude: ${longitude}, ${latitude}</p>`)
        );
    });

    // Create a layer group for earthquake markers
    let earthquakeLayer = L.layerGroup(earthquakeMarkers);
    earthquakeLayer.addTo(myMap);
}