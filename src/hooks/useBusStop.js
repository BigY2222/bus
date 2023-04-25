import { useContext, createContext } from "react"

export const InitialConetxt = createContext([])


export const useBusStops = () => {
  const busStops = useContext(InitialConetxt)
  return busStops
}
