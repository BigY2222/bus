export const getDistanceMatrix = async (origins, destinations) => {
  const request = {
    origins,
    destinations,
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false,
  };
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService()
    service.getDistanceMatrix(request, (response, status) => {
      if (status === 'OK' && response) {
       console.log('response', response)
       resolve(response)
      }
    })
  })
}