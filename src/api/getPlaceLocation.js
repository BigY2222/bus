export const getPlaceLocation = (place) => {
  const request = {
    query: place.placeId,
    fields: ["geometry"],
  }
  return new Promise((resolve, reject) => {
    google.PlacesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        if (place.geometry && place.geometry.location) {
          resolve(place.geometry.location)
        } else {
          alert(`${JSON.stringify(place)} it not found`)
          reject()
        }
      }
    })
  })
}