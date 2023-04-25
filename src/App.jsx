import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from 'antd'
import { PlaceSearch, PLACE_TYPE } from './components/placeSearch'
import { FilterList } from './components/filterList'
import { Route } from './components/route'
import { useDebounceValue, InitialConetxt } from './hooks'
import { getBusStops, getGooglePlaces, getBusLine } from './api'
import { Bus_Lines } from './constants'

const App = () => {
  const [busStops, setBusStops] = useState([])
  const [busLines, setBusLines] = useState([])
  const [activeType, setActiveType] = useState('')
  const [placesList, setPlacesList] = useState([])
  const [startPlace, setStartPlace] = useState({ address: ''})
  const [endPlace, setEndPlace] = useState({ address: ''})
  const [showRoute, setShowRoute] = useState(false)
  const blurTimer1 = useRef(null)
  const blurTimer2 = useRef(null)
  const placeRef = useRef({ })
  const searchStartPlace = useDebounceValue(startPlace)
  const searchEndPlace = useDebounceValue(endPlace)

  const fetchPlaces = useCallback(async (place) => {
    // fetch google place
    if (place.address && !place.location) {
      const places = await getGooglePlaces(place.address)
      const filterBusStops = busStops.filter(stop => stop.address.includes(place.address))
      setPlacesList([...filterBusStops, ...places])
    } else {
      setPlacesList(busStops)
    }
  }, [busStops])

  const selectPlace = useCallback((place) => {
    
    if (activeType === PLACE_TYPE.START) {
      setStartPlace({ ...place })
    } else if (activeType === PLACE_TYPE.END) {
      setEndPlace({ ...place })
    }
  }, [activeType])

  placeRef.current = {
    start: startPlace,
    end: endPlace
  }

  const startInput = {
    onFocus: (placeType) => {
      if (blurTimer1.current) {
        clearTimeout(blurTimer1.current)
        blurTimer1.current = null
      }
      setActiveType(placeType)
    },
    onBlur: () => {
      blurTimer1.current = setTimeout(() => {
        setActiveType('')
        const { start } = placeRef.current
        console.log(placesList, start?.address)
        const expectedStartPlace = placesList.find(({ address }) => start?.address && address.includes(start?.address))
        if (!expectedStartPlace) {
          setStartPlace({ address: ''})
        } else {
          setStartPlace({ ...expectedStartPlace })
        }
      }, 200)
    }
  }
  const endInput = {
    onFocus: (placeType) => {
      if (blurTimer2.current) {
        clearTimeout(blurTimer2.current)
        blurTimer2.current = null
      }
      setActiveType(placeType)
    },
    onBlur: () => {
      blurTimer2.current = setTimeout(() => {
        setActiveType('')
        const { end } = placeRef.current
        const expectedEndPlace = placesList.find(({ address }) => address === end?.address)
        if (!expectedEndPlace) {
          setEndPlace({ address: ''})
        } else {
          setEndPlace(expectedEndPlace)
        }
      }, 200)
    }
  }

  useEffect(() => {
    setShowRoute(false)
  }, [searchStartPlace, searchEndPlace])

  useEffect(() => {
    const fetchStations = async () => {
      const { BusStopsResult: { busstops } } = await getBusStops()
      const stops = busstops.map(({ LongName, latitude, longitude }) => {
        return {
          address: LongName,
          location: { lat: latitude, lng: longitude },
          isBus: true
        }
      })
      setBusStops(stops)
    }
    const fetchBusLines = async () => {
      const asyncTasks = Bus_Lines.map(line => {
        return getBusLine(line)
      })
      const results = await Promise.all(asyncTasks)
      const lines = {}
      results.forEach((result, index) => {
        lines[Bus_Lines[index]] = result.PickupPointResult.pickuppoint.map(({ LongName }) => LongName)
      })
      setBusLines(lines)
    }
    fetchStations()
    fetchBusLines()
  }, [])

  useEffect(() => {
    if (!activeType) {
      setPlacesList([])
    } else {
      fetchPlaces(activeType === PLACE_TYPE.START ? searchStartPlace : searchEndPlace)
    }
  }, [activeType, searchStartPlace, searchEndPlace])
  return (
    <InitialConetxt.Provider value={{ busStops, busLines }}>
      <div className='flex flex-col gap-4 max-w-[375px] mx-auto'>
        <div className='flex flex-col rounded-2xl bg-white gap-4 px-4 py-7 border border-white-10'>
          <PlaceSearch placeholder="Input Start point" value={startPlace} onChange={setStartPlace} onFocus={startInput.onFocus} onBlur={startInput.onBlur} placeType={PLACE_TYPE.START}  />
          <PlaceSearch placeholder="Input End point" value={endPlace} onChange={setEndPlace} onFocus={endInput.onFocus} onBlur={endInput.onBlur} placeType={PLACE_TYPE.END} />
          <Button type="primary" danger onClick={() => setShowRoute(true)}>Search route</Button>
        </div>
        {activeType && <FilterList options={placesList} onSelect={selectPlace} />}
        {!activeType && showRoute && <Route startPlace={startPlace} endPlace={endPlace} />}
      </div>
      </InitialConetxt.Provider>
  )
}

export default App
