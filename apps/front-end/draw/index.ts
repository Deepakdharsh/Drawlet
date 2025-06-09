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

type HandlePosition =
  | "top-left" | "top" | "top-right"
  | "right" | "bottom-right" | "bottom"
  | "bottom-left" | "left"
  | "rotate";

interface Handle {
  x: number;
  y: number;
  position: HandlePosition;
}

export default async function initDraw(canvas:HTMLCanvasElement,roomId:number,socket:WebSocket,setZoomPercentage){

    const ctx=canvas.getContext("2d") 
    
    const existingShape:Shape[] = await getExistingShapes(roomId)

    if(!ctx){
        return 
    }
    let offSetX=0
    let offSetY=0
    let scale=1;

    let clicked=false
    let startX=0
    let startY=0
    const strokes:Strokes[]=[]
    const canvasOffsetX = canvas.offsetLeft

    // let selectedShapeIndex ;
    // let activeHandles:Handle[]=[];
    // let activeDragHandle;

    socket.onmessage=(event)=>{
        const message=JSON.parse(event.data)
        if(message.type=="chat"){
            existingShape.push(JSON.parse(message.message))
            clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
        }
    }
    // let isZooming=false
    // let lastX, lastY;
    
    
    clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)

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
    clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
    })

    function updateZoomingDisplay(){
        const zoomPercent = Math.round(scale * 100)
        setZoomPercentage(zoomPercent)
        console.log(`Zoom: ${zoomPercent}`)
    }

    function updatePanning(){
        console.log("entered Panning")
        // ctx?.setTransform(1,0,0,1,0,0)
        //@ts-expect-error daffs
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //@ts-expect-error dfadasfa
        ctx.fillStyle="rgba(0,0,0)"
        ctx?.fillRect(0,0,canvas.width,canvas.height)

        // ctx?.scale(scale, scale); 
        

        // if(isZooming){
        //     isZooming=false
        // }

        ctx?.setTransform(scale, 0, 0, scale, offSetX, offSetY);
        // ctx?.translate(offSetX,offSetY)

        // if(!isZooming){
        // }


        updateZoomingDisplay()
        //@ts-expect-error daffs
        clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)

    }

//     // function isPointInsideShape(shape:Shape,x:number,y:number):boolean{
//     //     switch(shape.type){
//     //         case "rect":
//     //             return (
//     //                 x >= shape.x &&
//     //                 x <= shape.x + shape.width &&
//     //                 x >= shape.y &&
//     //                 x <= shape.y + shape.height
//     //             )
//     //         case "circle":
//     //             const dx=x-shape.rectX
//     //             const dy=y-shape.rectY
//     //             return Math.sqrt(dx * dx + dy * dy) <= shape.size
//     //         default : 
//     //         return false
//     //     }
//     // }

//     // function drawHandles(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){
//     //     const size=8
//     //     const half = size / 2

//     //     const position:Handle[]=[
//     //         { x: x, y: y, position: "top-left" },
//     //         { x: x + w / 2, y: y, position: "top" },
//     //         { x: x + w, y: y, position: "top-right" },
//     //         { x: x + w, y: y + h / 2, position: "right" },
//     //         { x: x + w, y: y + h, position: "bottom-right" },
//     //         { x: x + w / 2, y: y + h, position: "bottom" },
//     //         { x: x, y: y + h, position: "bottom-left" },
//     //         { x: x, y: y + h / 2, position: "left" },
//     //         { x: x + w / 2, y: y - 20, position: "rotate" },
//     //     ]

//     //     activeHandles=position

//     //     ctx.fillStyle="cyan";
//     //     for(const handle of position ){
//     //         ctx.beginPath()
//     //         ctx.arc(handle.x,handle.y,half,0,Math.PI * 2)
//     //         ctx.fill()
//     //     }
//     // }

//     // function drawBoundingBox(ctx:CanvasRenderingContext2D,shape:Shape){
//     //     let x=0,y=0,w=0,h=0;

//     //     if(shape.type=="rect"){
//     //         x=shape.x
//     //         y=shape.y
//     //         w=shape.width
//     //         h=shape.height
//     //     }

//     //     ctx.save();
//     //     ctx.strokeStyle = "yellow";
//     //     ctx.lineWidth = 1;
//     //     ctx.setLineDash([5, 5]);
//     //     ctx.strokeRect(x, y, w, h);
//     //     ctx.setLineDash([])

//     //     drawHandles(ctx, x, y, w, h);
//     //     ctx.restore();
//     // }

//     // function getHandle(x:number,y:number):Handle|null{
//     //     const handleSize=8
//     //     for(const handle of activeHandles){
//     //         const dx=x-handle.x;
//     //         const dy=y-handle.y
//     //     if(Math.sqrt(dx*dx*dy*dy) <= handleSize)
//     //         return handle
//     //     }
//     //     return null
//     // }

//     function getBoundingBox(shape: Shape): { x: number; y: number; width: number; height: number } {
//   switch (shape.type) {
//     case 'rect':
//       return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };

//     case 'circle':
//       return { x: shape.rectX, y: shape.rectY, width: shape.size, height: shape.size };

//     case 'line':
//       const minX = Math.min(shape.startX, shape.endX);
//       const minY = Math.min(shape.startY, shape.endY);
//       const maxX = Math.max(shape.startX, shape.endX);
//       const maxY = Math.max(shape.startY, shape.endY);
//       return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

//     case 'pencil':
//       const allX = shape.strokes.map(s => s.x);
//       const allY = shape.strokes.map(s => s.y);
//       const minPx = Math.min(...allX);
//       const minPy = Math.min(...allY);
//       const maxPx = Math.max(...allX);
//       const maxPy = Math.max(...allY);
//       return { x: minPx, y: minPy, width: maxPx - minPx, height: maxPy - minPy };

//     default:
//       return { x: 0, y: 0, width: 0, height: 0 };
//   }
// }


//     function drawBoundingBox(ctx: CanvasRenderingContext2D, shape: Shape){
//     ctx.save();
//   ctx.strokeStyle = 'blue';
//   ctx.setLineDash([4, 2]);
//   ctx.lineWidth = 1;

//   const { x, y, width, height } = getBoundingBox(shape);
//   ctx.strokeRect(x, y, width, height);
//   ctx.setLineDash([]);

//   // Draw 8 resize handles
//   const size = 8;
//   const half = size / 2;

//   const points = [
//     [x, y],
//     [x + width / 2, y],
//     [x + width, y],
//     [x + width, y + height / 2],
//     [x + width, y + height],
//     [x + width / 2, y + height],
//     [x, y + height],
//     [x, y + height / 2],
//   ];

//   ctx.fillStyle = 'white';
//   ctx.strokeStyle = 'black';

//   points.forEach(([cx, cy]) => {
//     ctx.beginPath();
//     ctx.rect(cx - half, cy - half, size, size);
//     ctx.fill();
//     ctx.stroke();
//   });

//   ctx.restore();
//   }


    canvas.addEventListener("mousedown",(e)=>{
        clicked=true

        //@ts-expect-error fsfs
        if(window.shapeType=="panning"){
            startX = e.clientX;
            startY = e.clientY;
            return;
        }

        const {x,y} = toWorld(e.clientX,e.clientY)
        startX=x
        startY=y

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

        // selectedShapeIndex=null

        // for(let i=existingShape.length-1;i>=0;i--){
        //     if(isPointInsideShape(existingShape[i],x,y)){
        //         selectedShapeIndex=i
        //         break;
        //     }
        // }

        // if(selectedShapeIndex !== null){
        //     drawBoundingBox(ctx, existingShape[selectedShapeIndex]);
        //     const handle=getHandle(x,y)
        //     if(handle){
        //         activeDragHandle = handle.position
        //         return 
        //     }
        // }
        // // clearCanvas(existingShape,canvas,ctx,scale,x,y)
    })
    
    canvas.addEventListener("mouseup",(e)=>{
        clicked=false
        const {x,y} = toWorld(e.clientX,e.clientY)
        const width=x-startX;
        const height=y-startY;

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
            // ctx.setTransform(1, 0, 0, 1, 0, 0);

            const {x,y} = toWorld(e.clientX,e.clientY)
            const rect = canvas.getBoundingClientRect();
            const EraseX = x - rect.left;
            const EraseY = y - rect.top;

            const width=x-startX
            const height=y-startY
            // const width=(x-rect.left)-startX
            // const height=(y-rect.top)-startY

            const size=Math.min(Math.abs(width),Math.abs(height))
            const rectX = width < 0 ? startX - size : startX;
            const rectY = height < 0 ? startY - size : startY;


            ctx.strokeStyle="rgba(255,255,255)"

            //@ts-expect-error dfa
            if(window.shapeType=="rect"){
                // ctx.setTransform(scale, 0, 0, scale, offSetX, offSetY);
                clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
                ctx.strokeRect(startX,startY,width,height)
                //@ts-expect-error fads
            }else if(window.shapeType=="circle"){
                // ctx.setTransform(scale, 0, 0, scale, offSetX, offSetY);
                clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
                ctx.beginPath();
                ctx.ellipse( rectX + size / 2, rectY + size / 2, size / 2, size / 2 , 0 ,0 , 2 * Math.PI);
                ctx.stroke()
                // ctx.closePath()
                //@ts-expect-error dfa
            }else if(window.shapeType=="line"){
                clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
                ctx.beginPath()
                ctx.moveTo(startX,startY)
                ctx.lineTo(x,y)
                ctx.stroke()
                // ctx.closePath()
                //@ts-expect-error dfa
            }else if(window.shapeType=="pencil"){
                strokes.push({
                    currentX:x-canvasOffsetX,
                    currentY:y
                })

                ctx.lineTo(x-canvasOffsetX,y)
                ctx.stroke()
                //@ts-expect-error dfa
            }else if(window.shapeType=="erase"){
                console.log("using eraser")
               const index = eraseAt(EraseX,EraseY,existingShape)
               console.log(index)
                if(index!==-1){
                    existingShape.splice(index,1)
                    clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
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
            
            // if (activeDragHandle && selectedShapeIndex !== null) {
            //      const shape = existingShape[selectedShapeIndex];
            //     if (shape.type === "rect") {
            //     let newX = shape.x;
            //     let newY = shape.y;
            //     let newWidth = shape.width;
            //     let newHeight = shape.height;

            //         switch (activeDragHandle) {
            //             case "top-left":
            //             newWidth += (newX - x);
            //             newHeight += (newY - y);
            //             newX = x;
            //             newY = y;
            //             break;
            //             case "top":
            //             newHeight += (newY - y);
            //             newY = y;
            //             break;
            //             case "top-right":
            //             newWidth = x - newX;
            //             newHeight += (newY - y);
            //             newY = y;
            //             break;
            //             case "right":
            //             newWidth = x - newX;
            //             break;
            //             case "bottom-right":
            //             newWidth = x - newX;
            //             newHeight = y - newY;
            //             break;
            //             case "bottom":
            //             newHeight = y - newY;
            //             break;
            //             case "bottom-left":
            //             newWidth += (newX - x);
            //             newHeight = y - newY;
            //             newX = x;
            //             break;
            //             case "left":
            //             newWidth += (newX - x);
            //             newX = x;
            //             break;
            //         }

            //         newWidth = Math.max(newWidth, 5);
            //         newHeight = Math.max(newHeight, 5);

            //         shape.x = newX;
            //         shape.y = newY;
            //         shape.width = newWidth;
            //         shape.height = newHeight;
            //         clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
            //         drawBoundingBox(ctx, shape);
            //     }
            // }
                        
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

function clearCanvas(existingShape:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,scale:number,x:number,y:number){
    console.log("entered clearCanvas")
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.clearRect(0,0,canvas.width,canvas.height) 

    
    ctx.fillStyle="rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    ctx.setTransform(scale, 0, 0, scale, x, y);
    
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


