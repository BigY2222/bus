
export const getRoute = (origin, destination) => {
  const directionsService = new google.maps.DirectionsService()
  const request = {
    origin,
    destination,
    travelMode: 'TRANSIT'
  }
  return new Promise((resolve) => {
    directionsService.route(request, (result, status) => {
      if (status == 'OK') {
        resolve(result)
      }
    })
  })
}