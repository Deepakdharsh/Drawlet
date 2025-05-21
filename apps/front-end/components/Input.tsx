import React from "react"

interface InputProps{
    placeholder:string
    type:string
}

export default function Input({placeholder,type}:InputProps,ref:React.Ref<HTMLInputElement>){
    return <div>
        <input ref={ref} type={type} placeholder={placeholder} className="outline-none border rounded-sm p-1 m-4"/>
    </div>
}