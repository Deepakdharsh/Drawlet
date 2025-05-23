import { useEffect, useState } from "react"

export default function UseSocket(){
    const [ws,setWs]=useState<WebSocket>()

    useEffect(()=>{
        // const token=localStorage.getItem("token")
        //@ts-expect-error dfadf
        const websocket=new WebSocket({port:`ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyZjI2YWIxLWQwNDktNGJmOC1iZGMzLTgxZjA2Nzk1ZjcyYiIsImlhdCI6MTc0Nzk4OTY1OCwiZXhwIjoxNzQ4NTk0NDU4fQ.h_dtcYrX88qmKb-N_6ZfwExQb1s6IiIuQmbO7tBQFg0`})
        setWs(websocket)
        return ()=>{
            ws?.close()
        }
    },[])

    return {ws}
}