const google = {
  map: null,
  autocompleteService: null,
  placeService: null
}
function initMap() {
  const sydney = new google.maps.LatLng(-33.867, 151.195);

  google.map = new google.maps.Map(document.getElementById("map"), {
    center: sydney,
    zoom: 15,
  });

  google.placeService = new google.maps.places.PlacesService(map)
  google.autocompleteService = new google.maps.places.AutocompleteService()
}
window.initMap = initMap
window.google = google