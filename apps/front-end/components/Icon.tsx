import { ReactNode } from "react"

interface IconProps {
    onclick:(type:"circle"|"rect"|"line")=>void,
    icon:ReactNode
    type:"circle"|"rect"|"line"
}

function Icon({onclick,icon,type}:IconProps) {
  function handleClick(){
    onclick(type)
  }
  return (
    <button  className={`m-2 p-2 bg-gray-300 hover:bg-amber-100`} onClick={handleClick}>
      {icon}
    </button>
  )
}

export default Icon
