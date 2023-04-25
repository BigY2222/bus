export const FilterList = (props) => {
  const { options = [], onSelect } = props

  return <div className="flex flex-col px-4 max-h-80 rounded-2xl bg-white border border-white-10 overflow-y-auto">
    {options.map((place, index) => {
      return <div key={index} className="flex flex-col justify-center gap-0.5 py-5 border-b border-gray-10 cursor-pointer hover:opacity-40" onClick={() => onSelect({ ...place
      })}>
        <div className="text-black text-base">{place.address}</div>
        {place?.isBus ? <div className="text-red-10 text-sm">School Bus Station</div> : ''}
      </div>
    })}
  </div>
}