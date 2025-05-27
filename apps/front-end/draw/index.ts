import { api } from "@/api/axios"

type Shape={
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
} | {
    type:"circle",
    rectX:number,
    rectY:number,
    size:number
} 

export default async function initDraw(canvas:HTMLCanvasElement,roomId:number,socket:WebSocket){

    const ctx=canvas.getContext("2d") 
    
    const existingShape:Shape[] = await getExistingShapes(roomId)

    if(!ctx){
        return 
    }

    socket.onmessage=(event)=>{
        console.log("entered the message")
        const message=JSON.parse(event.data)
        if(message.type=="chat"){
            existingShape.push(JSON.parse(message.message))
            clearCanvas(existingShape,canvas,ctx)
        }
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

        const size=Math.min(Math.abs(width),Math.abs(height))

        const rectX = width < 0 ? startX - size : startX;
        const rectY = height < 0 ? startY - size : startY;

        // existingShape.push({
        //     type:"rect",
        //     y:startY,
        //     x:startX,
        //     height,
        //     width
        // })

        if("rect"){
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
        }else if("circle"){
            socket.send(JSON.stringify({
            type:"chat",
            message:JSON.stringify({
                type:"rect",
                rectX,
                rectY,
                size,
            }),
            roomId
          }))
        }

      

    })

    
    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
            const width=e.clientX-startX
            const height=e.clientY-startY

            const size=Math.min(Math.abs(width),Math.abs(height))
            const rectX = width < 0 ? startX - size : startX;
            const rectY = height < 0 ? startY - size : startY;

            clearCanvas(existingShape,canvas,ctx)

            if("rect"){
                ctx.strokeStyle="rgba(255,255,255)"
                ctx.strokeRect(startX,startY,width,height)
            }else if("circle"){
                ctx.beginPath();
                ctx.ellipse( rectX + size / 2, rectY + size / 2, size / 2, size / 2 , 0 ,0 , 2 * Math.PI);
                ctx.stroke();
            }
            

            
        }
    })
    
}

function clearCanvas(existingShape:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height) 
    ctx.fillStyle="rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.strokeStyle="rgba(255,255,255)"
    existingShape.map((shape)=>{
        if(shape.type=="rect"){
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }else if(shape.type=="circle"){
            ctx.beginPath();
            ctx.ellipse( shape.rectX + shape.size / 2, shape.rectY + shape.size / 2, shape.size / 2, shape.size / 2 , 0 ,0 , 2 * Math.PI);
            ctx.stroke(); 
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
