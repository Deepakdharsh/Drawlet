"use client"
import initDraw from "@/draw"
import UseSocket from "@/hooks/useSocket"
import { useEffect, useRef } from "react"

export function Canvas({roomId}:{roomId:string}){
    const canvasRef=useRef<HTMLCanvasElement>(null)
    const {ws,laoding}=UseSocket()

    useEffect(()=>{
        if(canvasRef.current){;
            initDraw(canvasRef.current,roomId)
        }
        
    },[canvasRef])


    if(laoding) return <div>connecting to server...</div>

    return <div >
        <canvas ref={canvasRef} className="block" ></canvas>
    </div>
}