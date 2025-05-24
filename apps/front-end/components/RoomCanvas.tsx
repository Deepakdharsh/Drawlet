"use client"
import UseSocket from "@/hooks/useSocket"
import Canvas from "./Canvas"

export function RoomCanvas({roomId}:{roomId:number}){
    const {ws,laoding}=UseSocket(roomId)

    if(laoding) return <div>connecting to server...</div>

    return <div >
      <Canvas roomId={roomId} ws={ws}/>
    </div>
}