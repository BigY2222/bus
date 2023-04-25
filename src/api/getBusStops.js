export const getBusStops = () => {
  const headers = new Headers()
  headers.append('Authorization', 'Basic TlVTbmV4dGJ1czoxM2RMP3pZLDNmZVdSXiJU')
  return fetch('https://nnextbus.nus.edu.sg/BusStops', {
    method: 'GET',
    headers,
  }).then(response => response.json())
}
