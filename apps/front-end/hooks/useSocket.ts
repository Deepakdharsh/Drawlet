import { useEffect, useState } from "react"

export default function UseSocket(roomId:number){
    const [ws,setWs]=useState<WebSocket>()
    const [laoding,setLoading]=useState(true)

    useEffect(()=>{
        // const token=localStorage.getItem("token")
        const websocket=new WebSocket(`ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyZjI2YWIxLWQwNDktNGJmOC1iZGMzLTgxZjA2Nzk1ZjcyYiIsImlhdCI6MTc0Nzk4OTY1OCwiZXhwIjoxNzQ4NTk0NDU4fQ.h_dtcYrX88qmKb-N_6ZfwExQb1s6IiIuQmbO7tBQFg0`)
        websocket.onopen=()=>{
            setLoading(false)
            setWs(websocket)

            if(!ws) return 

            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }

        websocket.onerror=()=>{
            setLoading(false)
        }
        
        return ()=>{
            ws?.close()
        }
    },[roomId,ws])

    return {ws,laoding}
}