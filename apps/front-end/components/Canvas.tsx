"use client"
import initDraw from '@/draw'
import React, { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import {Square,Circle,Minus,Pencil,Eraser,Hand,CornerUpLeft,CornerUpRight,MousePointer} from "lucide-react"
import UseSocket from '@/hooks/useSocket'

type ShapeType = "rect" | "circle" | "line" | "pencil" | "erase" | "panning" | "undo" | "redo" | "select"

function Canvas({roomId}:{roomId:number}) {
    const canvasRef=useRef<HTMLCanvasElement>(null)
    const {ws,laoding}=UseSocket(roomId)
    const [isPanning,setPanning]=useState(false)
    const [zoomPercentage,setZoomPercentage]=useState(0)
    useEffect(()=>{
      console.log("entered here")
      if( ws == null) return
      
        if(canvasRef.current){;
          initDraw(canvasRef.current,roomId,ws,setZoomPercentage)
        }
      console.log("MOUNTED")

      return ()=>{
        console.log("UNMOUNTED")
      }

    },[roomId,ws])

    function handleClick(type:ShapeType):void{
      //@ts-expect-error dfha
      window.shapeType=type
      if(type=="panning"){
        setPanning(true)
      }else{
        setPanning(false)
      }
    }
  
    if(laoding) return <div>Loading...</div>

  return (
    <div className={`${isPanning ? "cursor-grab" : "" }`}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="block"></canvas>
        <div className='text-amber-50 absolute top-10 left-1/2 -translate-x-1/2 '>
          <Icon type={"select"} onclick={handleClick} icon={<MousePointer />}/>
          <Icon type={"panning"} onclick={handleClick} icon={<Hand/>}/>
          <Icon type={"rect"} onclick={handleClick} icon={<Square/>}/>
          <Icon type={"circle"} onclick={handleClick}icon={<Circle/>}/>
          <Icon type={"line"} onclick={handleClick} icon={<Minus />}/>
          <Icon type={"pencil"} onclick={handleClick} icon={<Pencil />}/>
          <Icon type={"erase"} onclick={handleClick} icon={<Eraser />}/>
        </div>
        <div className=' bg-gray-500 absolute text-amber-50 bottom-1/20 left-1/18 rounded'>
         <button className='dcZoom px-2 py-2 hover:text-black hover:bg-amber-100 rounded'>-</button>
         <button disabled={true} className='px-2'>{zoomPercentage}%</button>
         <button className='icZoom px-2 py-2 hover:text-black hover:bg-amber-100 rounded'>+</button>
        </div>
        <div className=' bg-gray-500 absolute text-amber-50 bottom-1/20 left-2/9 rounded '>
         <button className='icZoom px-3 p-2 hover:text-black hover:bg-amber-100 rounded'><CornerUpLeft /></button>
         <button className='icZoom px-3 p-2 hover:text-black hover:bg-amber-100 rounded'><CornerUpRight /></button>
        </div>
    </div>
  )
}

export default Canvas
