mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: picnicspot.geometry.coordinates, // starting position [lng, lat]
  zoom: 12.5, // starting zoom
  projection: "globe", // display the map as a 3D globe
});

map.addControl(new mapboxgl.NavigationControl());

map.on("style.load", () => {
  map.setFog({}); // Set the default atmosphere style
});

new mapboxgl.Marker()
  .setLngLat(picnicspot.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h5>${picnicspot.title}</h5><p>${picnicspot.location}</p>`)
      .setMaxWidth("150px")
  )
  .addTo(map);
