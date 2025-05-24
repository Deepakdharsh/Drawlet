import { useEffect, useState } from "react"

export default function UseSocket(){
    const [ws,setWs]=useState<WebSocket>()
    const [laoding,setLoading]=useState(true)

    useEffect(()=>{
        // const token=localStorage.getItem("token")
        const websocket=new WebSocket(`ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyZjI2YWIxLWQwNDktNGJmOC1iZGMzLTgxZjA2Nzk1ZjcyYiIsImlhdCI6MTc0Nzk4OTY1OCwiZXhwIjoxNzQ4NTk0NDU4fQ.h_dtcYrX88qmKb-N_6ZfwExQb1s6IiIuQmbO7tBQFg0`)
        websocket.onopen=()=>{
            setLoading(false)
            setWs(websocket)
        }

        websocket.onerror=()=>{
            setLoading(false)
        }
        
        return ()=>{
            ws?.close()
        }
    },[])

    return {ws,laoding}
}