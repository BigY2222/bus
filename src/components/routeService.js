import { getRoute, getDistanceMatrix } from '../api'
import { dijkstra } from '../utils/dijkstra'

export class RouteService {
  constructor(stops, startPlace, endPlace, busLines) {
    this.stops = stops
    this.startPlace = startPlace
    this.endPlace = endPlace
    this.busLines = busLines
    this.buildGraph()
  }

  getLineNames(address) {
    return Object.keys(this.busLines).filter(line => {
      return this.busLines[line].includes(address)
    })
  }

  buildGraph() {
    const graph = {}
    const busLines = Object.keys(this.busLines).map(name => this.busLines[name])
    for (const line of busLines) {
      let n1, n2
      for (let i = 1; i < line.length; i++) {
        n1 = line[i - 1]
        n2 = line[i]
        if (!graph[n1]) graph[n1] = {}
        if (!graph[n2]) graph[n2] = {}
        graph[n1][n2] = 1
        graph[n2][n1] = 1
      }
    }
    this.graph = graph
  }

  setEdges(graph, n1, n2) {
    if (!graph[n1]) graph[n1] = {}
    if (!graph[n2]) graph[n2] = {}
    graph[n1][n2] = 1
    graph[n2][n1] = 1
  }
  
  isSchooldStation(place) {
    return this.stops.some(stop => stop.address === place.address)
  }

  async fetchGoogleRoutes(startAddress, endAddress) {
    const { status, routes } = await getRoute(startAddress, endAddress)
    if (status === 'OK') {
      try {
        const allSteps = []
        routes[0].legs.forEach(({ steps }) => {
          steps.forEach(step => {
            let tip = ''
            if (step?.transit?.line) {
              const departure_stop = step.transit.departure_stop.name
              const arrival_stop = step.transit.arrival_stop.name
              const lineName = step.transit.line.name
              tip = `Take ${lineName}(${departure_stop} => ${arrival_stop})`
            }
            allSteps.push({
              distance: step.distance.text,
              duration: step.duration.text,
              travel_mode: step.travel_mode,
              address: step.instructions,
              tip,
            })
          })
        })
        return allSteps
      } catch(e) {
        return []
      }
    } else {
      return []
    }
  }

  getSchoolBusRoutes(p1, p2) {
    const paths = dijkstra.find_path(this.graph, p1, p2).map(stop => {
      return {
        address: stop,
        isBus: true,
        lines: this.getLineNames(stop)
      }
    })
    for (let i = 1; i < paths.length; i++) {
      const prev = paths[i - 1]
      const cur = paths[i]
      const { lines, address: address1 } = prev
      const { address: address2 } = cur
      prev.lines = lines.filter(line => {
        const stops = this.busLines[line]
        const i1 = stops.findIndex(address => address === address1)
        const i1last = stops.findLastIndex(address => address === address1)
        const i2 = stops.findIndex(address => address === address2)
        const i2last = stops.findLastIndex(address => address === address2)
        return Math.abs(i1 - i2) === 1 || Math.abs(i1 - i2last) === 1 || Math.abs(i1last - i2) === 1 || Math.abs(i1last - i2last) === 1
      })
      if ( i === paths.length - 1) cur.lines = []
    }
    return paths
  }

  async planRoutes() {
    const isStartInSchool = this.isSchooldStation(this.startPlace) 
    const isEndInSchool = this.isSchooldStation(this.endPlace)
    if (isStartInSchool && isEndInSchool) {
      const routes =this.getSchoolBusRoutes(this.startPlace.address, this.endPlace.address)
      return routes
    } else if (!isStartInSchool && !isEndInSchool){
      const routes = await this.planOutSchoolRoute()
      return routes
    } else if (isStartInSchool) {
      const routes = await this.planStartInSchoolRoute()
      return routes
    } else {
      const routes = await this.planEndInSchoolRoute()
      return routes
    }
  }

  async planOutSchoolRoute() {
    const googleRoutes = await this.fetchGoogleRoutes(this.startPlace.address, this.endPlace.address)
    return googleRoutes
  }

  async planStartInSchoolRoute() {
    const routes = []
    const destinations = this.endPlace.location ? [this.endPlace.location] : [{ placeId: this.endPlace.place_id }]
    const asyncTasks = new Array(Math.round(this.stops.length / 10)).fill(0).map((_, index) => {
      const sliceOrigins = this.stops.slice(index * 10, (index + 1) * 10).map(({ location }) => location)
      return getDistanceMatrix(sliceOrigins, destinations)
    })
    const results = await Promise.all(asyncTasks)
    let originIndex = 0
    const distances = []
    results.forEach(({ rows }) => {
      const origin = this.stops[originIndex]
      rows.forEach(({ elements }) => {
        distances.push([origin, elements[0].distance.value])
      })
      originIndex++
    })
    distances.sort((a, b) => a[1] - b[1])
    const nearByStop = distances[0][0]
    const schoolRoutes = this.getSchoolBusRoutes(this.startPlace.address, nearByStop.address)
    routes.push(...schoolRoutes)
    const googleRoutes = await this.fetchGoogleRoutes(nearByStop.address, this.endPlace.address)
    routes.push(...googleRoutes)
    return routes
  }

  async planEndInSchoolRoute() {
    const routes = []
    const origins = this.startPlace.location ? [this.startPlace.location] : [{ placeId: this.startPlace.place_id }]
    const asyncTasks = new Array(Math.round(this.stops.length / 10)).fill(0).map((_, index) => {
      const sliceDestinations = this.stops.slice(index * 10, (index + 1) * 10).map(({ location }) => location)
      return getDistanceMatrix(origins, sliceDestinations)
    })
    const results = await Promise.all(asyncTasks)
    let originIndex = 0
    const distances = []
    results.forEach(({ rows }) => {
      const origin = this.stops[originIndex]
      rows.forEach(({ elements }) => {
        distances.push([origin, elements[0].distance.value])
      })
      originIndex++
    })
    distances.sort((a, b) => a[1] - b[1])
    const nearByStop = distances[0][0]
    const googleRoutes = await this.fetchGoogleRoutes(this.startPlace.address, nearByStop.address)
    routes.push(...googleRoutes)
    const schoolRoutes = this.getSchoolBusRoutes(nearByStop.address, this.endPlace.address)
    routes.push(...schoolRoutes)
    return routes
  }
}