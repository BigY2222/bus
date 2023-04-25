import { Input } from 'antd'

export const PLACE_TYPE = {
  START: 'start',
  END: 'end'
}

export const PlaceSearch = (props) => {
  const { placeType, value: { address }, onChange, onFocus, onBlur, ...options } = props

  return <Input value={address} onChange={e => onChange({ address: e.target.value })} onFocus={() => onFocus(placeType)} onBlur={onBlur} {...options} />
}