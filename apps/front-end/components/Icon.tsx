import { ReactNode } from "react"

type shapes="circle"|"rect"|"line"|"pencil"|"erase"|"panning"|"undo"|"redo"

interface IconProps {
    onclick?:(type:shapes)=>void,
    icon:ReactNode
    type:shapes
}

function Icon({onclick,icon,type}:IconProps) {
  function handleClick(){
    if(!onclick) return
    onclick(type)
  }
  return (
    <button  className={`m-2 p-2 bg-gray-500 hover:text-black hover:bg-amber-100`} onClick={handleClick}>
      {icon}
    </button>
  )
}

export default Icon
