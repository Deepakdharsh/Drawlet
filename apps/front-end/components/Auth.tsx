import React from "react"

interface AuthProps{
  children:React.ReactNode,
  title:string
}

export default function Auth({children,title}:AuthProps) {
  return (
    <div className="bg-red-100 h-screen flex justify-center items-center">
      <div className="p-5 bg-red-50 h-5/10 w-sm text-black flex flex-col items-center">
        <h2 className="text-center text-2xl mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}


