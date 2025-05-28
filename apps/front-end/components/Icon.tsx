import { ReactNode } from "react"

interface IconProps {
    onclick:(type:"circle"|"rect"|"line")=>void,
    icon:ReactNode
    type:"circle"|"rect"|"line"
}

function Icon({onclick,icon,type}:IconProps) {
  return (
    <button  className="m-2" onClick={()=>onclick(type)}>
      {icon}
    </button>
  )
}

export default Icon
