export const getBusLine = (route_code) => {
  const headers = new Headers()
  headers.append('Authorization', 'Basic TlVTbmV4dGJ1czoxM2RMP3pZLDNmZVdSXiJU')
  return fetch(`https://nnextbus.nus.edu.sg/PickupPoint?route_code=${route_code}`, {
    method: 'GET',
    headers,
  }).then(response => response.json())
}
