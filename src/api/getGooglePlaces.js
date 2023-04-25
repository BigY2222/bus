export const getGooglePlaces = (place) => {
  // const request = {
  //   query: place,
  //   fields: ["name", "geometry"],
  // }
  return new Promise((resolve) => {
    google.autocompleteService.getQueryPredictions({ input: place }, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        const places = predictions.map(({ description, place_id }) => {
          return {
            address: description,
            isBus: false,
            place_id
            // location: {
            //   lat: geometry.location.lat(),
            //   lng: geometry.location.lng()
            // }
          }
        })
        // console.log('places', places)
        resolve(places)
      }
    })
  })
}