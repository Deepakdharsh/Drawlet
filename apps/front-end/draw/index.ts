import { api } from "@/api/axios"
import { json } from "stream/consumers"

type Shape={
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
} | {
    type:"client"
    centerX:number
    centery:number,
    radius:number
} 

export default async function initDraw(canvas:HTMLCanvasElement,roomId:number,socket:WebSocket){
    // console.log("initilized canvas")

    const ctx=canvas.getContext("2d") 
    
    const existingShape:Shape[] = await getExistingShapes(roomId)

    if(!ctx){
        return 
    }

    clearCanvas(existingShape,canvas,ctx)

    let clicked=false
    let startX=0
    let startY=0

    canvas.addEventListener("mousedown",(e)=>{
        clicked=true
        startX=e.clientX
        startY=e.clientY
        // console.log(e.clientX,"mouse down")
    })
    
    canvas.addEventListener("mouseup",(e)=>{
        clicked=false
        const width=e.clientX-startX;
        const height=e.clientY-startY;
        existingShape.push({
            type:"rect",
            x:startX,
            y:startY,
            height,
            width
        })

        socket.send(JSON.stringify({
            type:"chat",
            message:JSON.stringify({
            type:"rect",
            x:startX,
            y:startY,
            height,
            width
            }),
            roomId
        }))

    })

    
    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
            const width=e.clientX-startX
            const height=e.clientY-startY
            clearCanvas(existingShape,canvas,ctx)
            ctx.strokeStyle="rgba(255,255,255)"
            ctx.strokeRect(startX,startY,width,height)
            // console.log("clicked")
        }
    })
    
}

function clearCanvas(existingShape:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height) 
    ctx.fillStyle="rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.strokeStyle="rgba(255,255,255)"
    console.log(existingShape)
    existingShape.map((shape)=>{
        if(shape.type=="rect"){
            return ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }
    })
}

async function getExistingShapes(roomId:number){
   const res=await api.get(`/chat/${roomId}`)
   const messages=res.data.chats

   const shapes=messages.map((x:{message:string})=>{
        const messageData=JSON.parse(x.message)
        return messageData
   })
   console.log(shapes)
   return shapes
}