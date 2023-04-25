import { useState, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'

export const useDebounceValue = (newValue, delay = 100) => {
  const [value, setValue] = useState(newValue)

  const updateValue = useCallback(debounce((newVal) => {
    setValue(newVal)
  }, delay), [delay])

  useEffect(() => {
    updateValue(newValue)
  }, [newValue])

  return value
}