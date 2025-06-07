import { api } from "@/api/axios"

type Shape={
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
}| {
    type:"circle",
    rectX:number,
    rectY:number,
    size:number
}| {
    type:"line",
    startX:number,
    startY:number,
    endX:number,
    endY:number
} | {
    type:"pencil",
    strokes:Strokes[]
    startX:number,
    startY:number
}

type Strokes={
    currentX:number,
    currentY:number
}

export default async function initDraw(canvas:HTMLCanvasElement,roomId:number,socket:WebSocket,setZoomPercentage){

    const ctx=canvas.getContext("2d") 
    
    const existingShape:Shape[] = await getExistingShapes(roomId)

    if(!ctx){
        return 
    }

    socket.onmessage=(event)=>{
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
    const strokes:Strokes[]=[]
    const canvasOffsetX = canvas.offsetLeft

    let offSetX=0
    let offSetY=0
    // let isZooming=false
    // let lastX, lastY;

    let scale=1;

    const zoomPercent = Math.round(scale * 100)
    setZoomPercentage(zoomPercent)


    function toWorld(x: number, y: number) {
    return {
        x: (x - offSetX) / scale,
        y: (y - offSetY) / scale
    };
}

    document.querySelector(".icZoom")?.addEventListener("click",()=>{
        console.log("entered ic")
        zoomWithCenter(1.10)
    })
    
    document.querySelector(".dcZoom")?.addEventListener("click",()=>{
        console.log("entered dc")
        zoomWithCenter(0.90)
    })

    function zoomWithCenter(factor:number) {
    const zoomFactor = factor; // e.g. 1.05 or 0.95
    const newScale = scale * zoomFactor;

    const minZoom = 0.1;
    const maxZoom = 4;
    if (newScale < minZoom || newScale > maxZoom) return;

    // Use center of canvas instead of mouse position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const worldX = (centerX - offSetX) / scale;
    const worldY = (centerY - offSetY) / scale;

    scale = newScale;

    offSetX = centerX - worldX * scale;
    offSetY = centerY - worldY * scale;

    updatePanning();     // redraw canvas
    }

    window.addEventListener("resize",function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //  const dpr = window.devicePixelRatio || 1;
    //  canvas.width = window.innerWidth * dpr;
    //  canvas.height = window.innerHeight * dpr;
    //  canvas.style.width = window.innerWidth + 'px';
    //  canvas.style.height = window.innerHeight + 'px';
    //  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    //  ctx.scale(dpr, dpr); // Scale for high-DPI
    clearCanvas(existingShape,canvas,ctx)
    })

    function updateZoomingDisplay(){
        const zoomPercent = Math.round(scale * 100)
        setZoomPercentage(zoomPercent)
        console.log(`Zoom: ${zoomPercent}`)
    }

    function updatePanning(){
        console.log("entered Panning")
        ctx?.setTransform(1,0,0,1,0,0)
        //@ts-expect-error daffs
        ctx.fillStyle="rgba(0,0,0)"
        ctx?.fillRect(0,0,window.innerWidth,window.innerHeight)

        ctx?.scale(scale, scale); 
        

        // if(isZooming){
        //     isZooming=false
        // }

        ctx?.setTransform(scale, 0, 0, scale, offSetX, offSetY);
        // ctx?.translate(offSetX,offSetY)

        // if(!isZooming){
        // }


        updateZoomingDisplay()
        //@ts-expect-error daffs
        clearCanvas(existingShape,canvas,ctx)
    }


    canvas.addEventListener("mousedown",(e)=>{
        clicked=true
        startX=e.clientX
        startY=e.clientY

        //@ts-expect-error dfad
        if(window.shapeType=="pencil"){
            strokes.length=0
            ctx.strokeStyle="rgba(255,255,255)"
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath()
            ctx.moveTo(startX,startY)
            console.log(startX,startY)
            strokes.push({
                currentX:startX,
                currentY:startY
            })
        }
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
 

        //@ts-expect-error dfa
        if(window.shapeType=="rect"){
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
            //@ts-expect-error dfa
        }else if(window.shapeType=="circle"){
            console.log("entered the circle")
            socket.send(JSON.stringify({
                type:"chat",
                message:JSON.stringify({
                    type:"circle",
                    rectX,
                    rectY,
                    size,
                }),
                roomId
            }))
            //@ts-expect-error dfa
        }else if(window.shapeType=="line"){
            socket.send(JSON.stringify({
                type:"chat",
                message:JSON.stringify({
                    type:"line",
                    startX,
                    startY,
                    endX:e.clientX,
                    endY:e.clientY
                }),
                roomId
            }))
            //@ts-expect-error dfa
        }else if(window.shapeType=="pencil"){
            ctx.stroke();
            ctx.beginPath();
            socket.send(JSON.stringify({
                type:"chat",
                message:JSON.stringify({
                    type:"pencil",
                    startX,
                    startY,
                    strokes
                }),
                roomId
            }))
        }

    })

    
    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
            const rect = canvas.getBoundingClientRect();
            const EraseX = e.clientX - rect.left;
            const EraseY = e.clientY - rect.top;

            const width=(e.clientX-rect.left)-startX
            const height=(e.clientY-rect.top)-startY

            const size=Math.min(Math.abs(width),Math.abs(height))
            const rectX = width < 0 ? startX - size : startX;
            const rectY = height < 0 ? startY - size : startY;


            ctx.strokeStyle="rgba(255,255,255)"

            //@ts-expect-error dfa
            if(window.shapeType=="rect"){
                clearCanvas(existingShape,canvas,ctx)
                ctx.strokeRect(startX,startY,width,height)
                //@ts-expect-error fads
            }else if(window.shapeType=="circle"){
                clearCanvas(existingShape,canvas,ctx)
                ctx.beginPath();
                ctx.ellipse( rectX + size / 2, rectY + size / 2, size / 2, size / 2 , 0 ,0 , 2 * Math.PI);
                ctx.stroke()
                // ctx.closePath()
                //@ts-expect-error dfa
            }else if(window.shapeType=="line"){
                clearCanvas(existingShape,canvas,ctx)
                ctx.beginPath()
                ctx.moveTo(startX,startY)
                ctx.lineTo(e.clientX,e.clientY)
                ctx.stroke()
                // ctx.closePath()
                //@ts-expect-error dfa
            }else if(window.shapeType=="pencil"){
                strokes.push({
                    currentX:e.clientX-canvasOffsetX,
                    currentY:e.clientY
                })

                ctx.lineTo(e.clientX-canvasOffsetX,e.clientY)
                ctx.stroke()
                //@ts-expect-error dfa
            }else if(window.shapeType=="erase"){
                console.log("using eraser")
               const index = eraseAt(EraseX,EraseY,existingShape)
               console.log(index)
                if(index!==-1){
                    existingShape.splice(index,1)
                    clearCanvas(existingShape,canvas,ctx)
                }
                //@ts-expect-error dfa
            }else if(window.shapeType=="panning"){
                const dx=e.clientX-startX;
                const dy=e.clientY-startY;
                offSetX+=dx
                offSetY+=dy
                startX=e.clientX
                startY=e.clientY
                updatePanning()
            }
                        
        }
    })

    canvas.addEventListener("wheel",(e)=>{
        e.preventDefault()
        console.log("entered")
        const mouseX=e.clientX
        const mouseY=e.clientY

        console.log(`x : ${mouseX}, y : ${mouseY}`)
        
        const zoomFactor = 0.05;
        const zoom=e.deltaY < 0 ? (1 + zoomFactor) : (1 - zoomFactor)
        const minZoom=0.1
        const maxZoom=4
        
        const newScale = scale * zoom;
        
        const worldX = (mouseX - offSetX) / scale;
        const worldY = (mouseY - offSetY) / scale;
        
        if( newScale < minZoom  || newScale > maxZoom ) return 

        scale = newScale

       offSetX = mouseX - worldX * scale;
       offSetY = mouseY - worldY * scale;

        // isZooming=true
        updatePanning()
    })
    
}

/*  type:"rect",
    x:number,
    y:number,
    width:number,
    height:number */


/*  ctx.beginPath();
    ctx.ellipse( rectX + size / 2, rectY + size / 2, size / 2, size / 2 , 0 ,0 , 2 * Math.PI);
    ctx.stroke() */

function eraseAt(x:number,y:number,shapes:Shape[]){
    for(let i=shapes.length-1;i>=0;i--){
        const shape=shapes[i]
        if(shape.type=="rect"){
            if(x >= shape.x && x <= shape.x + shape.width &&
               y >= shape.y && y <= shape.y + shape.height 
            ){
                return i
            }
        }else if(shape.type=="circle"){
            const centerX = shape.rectX + shape.size / 2;
            const centerY = shape.rectY + shape.size / 2;
            const radius = shape.size / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            if (dx * dx + dy * dy <= radius * radius) {
                return i;
            }

        }
    }
    return -1
}

function clearCanvas(existingShape:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height) 
    ctx.fillStyle="rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.strokeStyle="rgba(255,255,255)"

    existingShape.forEach((shape)=>{
        if(shape.type=="rect"){
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }else if(shape.type=="circle"){
            ctx.beginPath();
            ctx.ellipse( shape.rectX + shape.size / 2, shape.rectY + shape.size / 2, shape.size / 2, shape.size / 2 , 0 ,0 , 2 * Math.PI);
            ctx.stroke(); 
            // ctx.closePath()
        }else if(shape.type=="line"){
            ctx.beginPath()
            ctx.moveTo(shape.startX,shape.startY)
            ctx.lineTo(shape.endX,shape.endY)
            ctx.stroke() 
            // ctx.closePath()
        }else if(shape.type=="pencil"){

            if(shape.type!=="pencil" || !shape.strokes) return 

            ctx.beginPath();
            ctx.moveTo(shape.strokes[0].currentX,shape.strokes[0].currentY)
            
            for(let i=1;i<shape.strokes.length;i++){
                ctx.lineTo(shape.strokes[i].currentX,shape.strokes[i].currentY)
            }
            ctx.stroke()
            
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


/* import { api } from "@/api/axios"
import { Shapes } from "lucide-react"

type Shape={
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
    
}| {
    type:"circle",
    rectX:number,
    rectY:number,
    size:number
}| {
    type:"line",
    startX:number,
    startY:number,
    endX:number,
    endY:number
} | {
    type:"pencil",
    strokes:Strokes[]
    startX:number,
    startY:number
}

type Strokes={
    currentX:number,
    currentY:number
}

export default async function initDraw(canvas:HTMLCanvasElement,roomId:number,socket:WebSocket){

    const ctx=canvas.getContext("2d") 
    
    const existingShape:Shape[] = await getExistingShapes(roomId)

    if(!ctx){
        return 
    }

    socket.onmessage=(event)=>{
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
    const strokes:Strokes[]=[]
    const canvasOffsetX = canvas.offsetLeft
    const canvasOffsetY = canvas.offsetTop

    canvas.addEventListener("mousedown",(e)=>{
        clicked=true
        startX=e.clientX - canvasOffsetX
        startY=e.clientY - canvasOffsetY

        //@ts-expect-error dfad
        if(window.shapeType=="pencil"){
            // Clear previous strokes for new drawing
            strokes.length = 0
            ctx.beginPath()
            ctx.moveTo(startX,startY)
            // Add the starting point to strokes
            strokes.push({
                currentX: startX,
                currentY: startY
            })
        }
    })
    
    canvas.addEventListener("mouseup",(e)=>{
        clicked=false
        const endX = e.clientX - canvasOffsetX
        const endY = e.clientY - canvasOffsetY
        const width = endX - startX
        const height = endY - startY

        const size=Math.min(Math.abs(width),Math.abs(height))

        const rectX = width < 0 ? startX - size : startX;
        const rectY = height < 0 ? startY - size : startY;

        //@ts-expect-error dfa
        if(window.shapeType=="rect"){
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
            //@ts-expect-error dfa
        }else if(window.shapeType=="circle"){
            socket.send(JSON.stringify({
                type:"chat",
                message:JSON.stringify({
                    type:"circle",
                    rectX,
                    rectY,
                    size,
                }),
                roomId
            }))
            //@ts-expect-error dfa
        }else if(window.shapeType=="line"){
            socket.send(JSON.stringify({
                type:"chat",
                message:JSON.stringify({
                    type:"line",
                    startX,
                    startY,
                    endX,
                    endY
                }),
                roomId
            }))
            //@ts-expect-error dfa
        }else if(window.shapeType=="pencil"){
            // Only send if we have strokes
            if(strokes.length > 0) {
                socket.send(JSON.stringify({
                    type:"chat",
                    message:JSON.stringify({
                        type:"pencil",
                        startX,
                        startY,
                        strokes: [...strokes] // Create a copy of strokes
                    }),
                    roomId
                }))
            }
        }    
    })

    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
            const currentX = e.clientX - canvasOffsetX
            const currentY = e.clientY - canvasOffsetY
            const width = currentX - startX
            const height = currentY - startY

            const size=Math.min(Math.abs(width),Math.abs(height))
            const rectX = width < 0 ? startX - size : startX;
            const rectY = height < 0 ? startY - size : startY;
            
            //@ts-expect-error dfa
            if(window.shapeType=="rect"){
                clearCanvas(existingShape,canvas,ctx)
                ctx.strokeStyle="rgba(255,255,255)"
                ctx.strokeRect(startX,startY,width,height)
                //@ts-expect-error fads
            }else if(window.shapeType=="circle"){
                clearCanvas(existingShape,canvas,ctx)
                ctx.strokeStyle="rgba(255,255,255)"
                ctx.beginPath();
                ctx.ellipse( rectX + size / 2, rectY + size / 2, size / 2, size / 2 , 0 ,0 , 2 * Math.PI);
                ctx.stroke()
                //@ts-expect-error dfa
            }else if(window.shapeType=="line"){
                clearCanvas(existingShape,canvas,ctx)
                ctx.strokeStyle="rgba(255,255,255)"
                ctx.beginPath()
                ctx.moveTo(startX,startY)
                ctx.lineTo(currentX,currentY)
                ctx.stroke()
                //@ts-expect-error dfa
            }else if(window.shapeType=="pencil"){
                strokes.push({
                    currentX,
                    currentY
                })
                ctx.strokeStyle="rgba(255,255,255)"
                ctx.lineTo(currentX,currentY)
                ctx.stroke()
            }
        }
    })
}

function clearCanvas(existingShape:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
    // Clear the entire canvas
    ctx.clearRect(0,0,canvas.width,canvas.height) 
    
    // Set background
    ctx.fillStyle="rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    
    // Set stroke style for all shapes
    ctx.strokeStyle="rgba(255,255,255)"
    ctx.lineWidth = 2
    
    // Render all existing shapes
    existingShape.forEach((shape)=>{
        if(shape.type=="rect"){
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }else if(shape.type=="circle"){
            ctx.beginPath();
            ctx.ellipse( shape.rectX + shape.size / 2, shape.rectY + shape.size / 2, shape.size / 2, shape.size / 2 , 0 ,0 , 2 * Math.PI);
            ctx.stroke(); 
        }else if(shape.type=="line"){
            ctx.beginPath()
            ctx.moveTo(shape.startX,shape.startY)
            ctx.lineTo(shape.endX,shape.endY)
            ctx.stroke() 
        }else if(shape.type=="pencil" && shape.strokes && shape.strokes.length > 0){
            ctx.beginPath();
            ctx.moveTo(shape.strokes[0].currentX, shape.strokes[0].currentY)
            
            for(let i = 1; i < shape.strokes.length; i++) {
                ctx.lineTo(shape.strokes[i].currentX, shape.strokes[i].currentY)
            }
            ctx.stroke()
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
} */