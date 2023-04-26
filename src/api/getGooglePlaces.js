export const getGooglePlaces = (place) => {
  return new Promise((resolve) => {
    google.autocompleteService.getPlacePredictions({ input: place, componentRestrictions: { country: "sg" } }, (predictions, status) => {
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