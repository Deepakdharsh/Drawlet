import { useEffect, useState } from "react"

export default function UseSocket(){
    const [ws,setWs]=useState<WebSocket>()

    useEffect(()=>{
        const token=localStorage.getItem("token")
        const websocket=new WebSocket({port:`ws://localhost:8080?token=${token}`})
        setWs(websocket)
        return ()=>{
            ws?.close()
        }
    },[])

    return {ws}
}