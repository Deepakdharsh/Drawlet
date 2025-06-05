"use client"
import initDraw from '@/draw'
import React, { useEffect, useRef } from 'react'
import Icon from './Icon'
import {Square,Circle,Minus,Pencil,Eraser } from "lucide-react"
import UseSocket from '@/hooks/useSocket'

type ShapeType = "rect" | "circle" | "line" | "pencil" | "erase"

function Canvas({roomId}:{roomId:number,}) {
    const canvasRef=useRef<HTMLCanvasElement>(null)
    const {ws,laoding}=UseSocket(roomId)
    useEffect(()=>{
      if( ws == null) return
      
        if(canvasRef.current){;
          initDraw(canvasRef.current,roomId,ws)
        }
      console.log("MOUNTED")

      return ()=>{
        console.log("UNMOUNTED")
      }

    },[roomId,ws])

    function handleClick(type:ShapeType):void{
      //@ts-expect-error dfha
      window.shapeType=type
    }
  
    if(laoding) return <div>Loading...</div>

  return (
    <div>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="block"></canvas>
        <div className='text-amber-50 absolute top-10 left-10'>
          <Icon type={"rect"} onclick={handleClick} icon={<Square/>}/>
          <Icon type={"circle"} onclick={handleClick}icon={<Circle/>}/>
          <Icon type={"line"} onclick={handleClick} icon={<Minus />}/>
          <Icon type={"pencil"} onclick={handleClick} icon={<Pencil />}/>
          <Icon type={"erase"} onclick={handleClick} icon={<Eraser />}/>
        </div>
    </div>
  )
}

export default Canvas
