import { useEffect, useRef, useState } from "react"

export default function UseSocket(roomId:number){
    // const [ws,setWs]=useState<WebSocket | null>(null)
    const socket=useRef<WebSocket|null>(null)
    const [laoding,setLoading]=useState(true)

    useEffect(()=>{
        // const token=localStorage.getItem("token")
        const websocket=new WebSocket(`ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEwYjdkZjZhLTQ2MjgtNDdlZi04Y2E2LWU4NWM0ZjU4NzI0NSIsImlhdCI6MTc0OTExODAzMCwiZXhwIjoxNzQ5NzIyODMwfQ.Y4LOluGxNlrA31KIyRzzHA3xdilxQksMCGc5OZ6PMUw`)

        websocket.onopen=()=>{
            setLoading(false)
            socket.current=websocket

            if(!socket.current) return 

            websocket.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }

        websocket.onerror=()=>{
            setLoading(false)
        }
        
        return ()=>{
            console.log("unmounted ")
            websocket?.close()
        }

    },[roomId,socket])

    return {ws:socket.current,laoding}
}