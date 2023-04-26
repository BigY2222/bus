import { useEffect, useMemo, useState, useContext } from "react"
import { Timeline } from 'antd'
import { RouteService } from './routeService'
import { InitialConetxt } from '../hooks'

export const Route = (props) => {
  const { startPlace, endPlace } = props
  const { busStops, busLines } = useContext(InitialConetxt)
  const [routes, setRoutes] = useState([])

  useEffect(() => {
    const getRoutes = async () => {
      const routeService = new RouteService(busStops, startPlace, endPlace, busLines)
      const planedRoutes = await routeService.planRoutes()
      console.log('routes', planedRoutes)
      setRoutes(planedRoutes)
    }
    getRoutes()
  }, [startPlace, endPlace, busStops, busLines])

  return <div className="p-4 max-h-96 rounded-2xl bg-white border border-white-10 overflow-y-auto">
    <Timeline items={routes.length === 0 ? [{ children: 'Start point and End point same place' }] : routes.map(({ address, isBus, distance, duration, lines, tip }) => {
      if (isBus) {
        return {
          children: lines.length > 0 ? <div><span className="font-bold">{address}</span> Take <span className="font-bold">{lines.join('/')}</span></div> : <div>Arrive at <span className="font-bold">{address}</span></div>
        }
      }
      return { children: <div>
        {tip && <div className="font-bold">{tip}</div> }
        <div dangerouslySetInnerHTML={{ __html: address }} />
        <div>distance: {distance}/duration: {duration}</div>
      </div> }
    })} />
  </div>
}