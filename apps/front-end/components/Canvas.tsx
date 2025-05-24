"use client"
import initDraw from '@/draw'
import React, { useEffect, useRef } from 'react'

function Canvas({roomId,ws}:{roomId:number,ws:any}) {
    const canvasRef=useRef<HTMLCanvasElement>(null)
    useEffect(()=>{
        // console.log(canvasRef.current)
        if(canvasRef.current){;
            // console.log("mounted")
            initDraw(canvasRef.current,roomId,ws)
        }
        
    },[])
  return (
    <div>
        <canvas ref={canvasRef} width={1000} height={1000} className="block" ></canvas>
    </div>
  )
}

export default Canvas
