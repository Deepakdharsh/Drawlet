import { api } from "@/api/axios"

type Shape={
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number,
    id:number
}| {
    type:"circle",
    rectX:number,
    rectY:number,
    size:number,
    id:number
}| {
    type:"line",
    startX:number,
    startY:number,
    endX:number,
    endY:number,
    id:number
} | {
    type:"pencil",
    strokes:Strokes[]
    startX:number,
    startY:number,
    id:number
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

interface TransformationState {
  selectedShapeIndex: number | null;
  activeHandles: Handle[];
  activeDragHandle: HandlePosition | null;
  isTransforming: boolean;
  startX: number;
  startY: number;
  originalShape: Shape | null;
}

const transState: TransformationState = {
        selectedShapeIndex: null,
        activeHandles: [],
        activeDragHandle: null,
        isTransforming: false,
        startX: 0,
        startY: 0,
        originalShape: null
};


export default async function initDraw(canvas:HTMLCanvasElement,roomId:number,socket:WebSocket,setZoomPercentage){

    const ctx=canvas.getContext("2d") 
    
    let existingShape:Shape[] = await getExistingShapes(roomId)
    console.log(existingShape)

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



    socket.onmessage=async(event)=>{
        const message=JSON.parse(event.data)
        if(message.type=="chat"){
            existingShape.push(JSON.parse(message.message))
            console.log(message.message)
            clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
        }

        // if(message.type=="updatedChat"){
        //     existingShape = await getExistingShapes(roomId)
        //     clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
        // }
    }
    
    
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

    function getShapeAtPoint(x: number, y: number): number | null {
    for (let i = existingShape.length - 1; i >= 0; i--) {
        const shape = existingShape[i];
        if (shape.type === "rect") {
        if (x >= shape.x && x <= shape.x + shape.width &&
            y >= shape.y && y <= shape.y + shape.height) return i;
        } else if (shape.type === "circle") {
        const dx = x - (shape.rectX + shape.size / 2);
        const dy = y - (shape.rectY + shape.size / 2);
        if (dx * dx + dy * dy <= (shape.size / 2) ** 2) return i;
        }
    }
    return null;
    }

    function generateHandles(shape: Shape): Handle[] {
        if (shape.type === "rect") {
            console.log("entered the handle")
            const { x, y, width, height } = shape;
            const cx = x + width / 2;
            const cy = y + height / 2;
            return [
            { x, y, position: "top-left" },
            { x: cx, y, position: "top" },
            { x: x + width, y, position: "top-right" },
            { x: x + width, y: cy, position: "right" },
            { x: x + width, y: y + height, position: "bottom-right" },
            { x: cx, y: y + height, position: "bottom" },
            { x, y: y + height, position: "bottom-left" },
            { x, y: cy, position: "left" },
            { x: cx, y: y - 30, position: "rotate" }, // Rotate handle
            ];
        }
      // Add support for circle, etc.
      return [];
    }

    function isPointInHandle(x:number,y:number,handle:Handle,radius=8){
        return Math.hypot(x-handle.x,y-handle.y) <= radius
    }


    // canvas.addEventListener("mousedown",(e)=>{
    //     clicked=true
    //     const {x,y} = toWorld(e.clientX,e.clientY)

    //     //@ts-expect-error fsfs
    //     if(window.shapeType=="select"){
    //         const index = getShapeAtPoint(x, y);

    //          // Check if handle was clicked
    //         for (const handle of transState.activeHandles) {
    //             if (isPointInHandle(x, y, handle)) {
    //                 transState.activeDragHandle = handle;
    //                 transState.isTransforming = true;
    //                 return;
    //             }
    //         }

    //         // No handle clicked, check for shape selection
    //         if (index !== null) {
    //             transState.selectedShapeIndex = index;
    //             transState.originalShape = JSON.parse(JSON.stringify(existingShape[index])); // clone
    //             transState.startX = x;
    //             transState.startY = y;
    //             transState.isTransforming = true;

    //             transState.activeHandles = generateHandles(existingShape[index]);
    //             if(transState.activeHandles){
    //                 clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
    //             }
    //         }
    //         return 
    //     }

    //     //@ts-expect-error fsfs
    //     if(window.shapeType=="panning"){
    //         startX = e.clientX;
    //         startY = e.clientY;
    //         return;
    //     }

    //     startX=x
    //     startY=y

    //     //@ts-expect-error dfad
    //     if(window.shapeType=="pencil"){
    //         strokes.length=0
    //         ctx.strokeStyle="rgba(255,255,255)"
    //         ctx.lineWidth = 1.5;
    //         ctx.lineCap = "round";
    //         ctx.lineJoin = "round";
    //         ctx.beginPath()
    //         ctx.moveTo(startX,startY)
    //         strokes.push({
    //             currentX:startX,
    //             currentY:startY
    //         })
    //     }

    // })

    canvas.addEventListener("mousedown", (e) => {
    clicked = true;

    const { x, y } = toWorld(e.clientX, e.clientY);

    //@ts-expect-error
    const shapeType = window.shapeType;

    if (shapeType === "select") {

        // Check if handle was clicked
        for (const handle of transState.activeHandles) {
            if (isPointInHandle(x, y, handle)) {
                transState.activeDragHandle = handle;
                transState.isTransforming = true;
                return;
            }
        }

        // No handle clicked, check for shape selection
        const index = getShapeAtPoint(x, y);
        if (index !== null) {
            transState.selectedShapeIndex = index;
            transState.originalShape = JSON.parse(JSON.stringify(existingShape[index])); // clone
            transState.startX = x;
            transState.startY = y;
            transState.isTransforming = true;
            transState.activeHandles = generateHandles(existingShape[index]);
            clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
        }
        return;
    }

    if (shapeType === "panning") {
        startX = e.clientX;
        startY = e.clientY;
        return;
    }

    startX = x;
    startY = y;

    if (shapeType === "pencil") {
        strokes.length = 0;
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        strokes.push({ currentX: startX, currentY: startY });
    }
});
 
//     canvas.addEventListener("mousemove",(e)=>{
//         if(clicked){

//             const {x,y} = toWorld(e.clientX,e.clientY)

//             const rect = canvas.getBoundingClientRect();
//             const EraseX = x - rect.left;
//             const EraseY = y - rect.top;

//             const width=x-startX
//             const height=y-startY

//             const size=Math.min(Math.abs(width),Math.abs(height))
//             const rectX = width < 0 ? startX - size : startX;
//             const rectY = height < 0 ? startY - size : startY;


//             ctx.strokeStyle="rgba(255,255,255)"

            

//             //@ts-expect-error dofnasd
//     if (window.shapeType === "select" && transState.isTransforming && transState.selectedShapeIndex !== null) {
//         const dx = x - transState.startX;
//         const dy = y - transState.startY;
//         const shape = existingShape[transState.selectedShapeIndex];
//         const orig = transState.originalShape;

//         if (transState.activeDragHandle) {
//         const handle = transState.activeDragHandle;

//         if (shape.type === "rect" && orig.type === "rect") {
//             let newX = orig.x;
//             let newY = orig.y;
//             let newWidth = orig.width;
//             let newHeight = orig.height;

//             const { position } = handle;

//             if (position.includes("left")) {
//             const delta = x - orig.x;
//             newX = orig.x + delta;
//             newWidth = orig.width - delta;
//             }

//             if (position.includes("right")) {
//             newWidth = x - orig.x;
//             }

//             if (position.includes("top")) {
//             const delta = y - orig.y;
//             newY = orig.y + delta;
//             newHeight = orig.height - delta;
//             }

//             if (position.includes("bottom")) {
//             newHeight = y - orig.y;
//             }

//             // Avoid negative width/height
//             newWidth = Math.max(10, newWidth);
//             newHeight = Math.max(10, newHeight);

//             shape.x = newX;
//             shape.y = newY;
//             shape.width = newWidth;
//             shape.height = newHeight;
//         }
//         } else {
//                     // No handle, just move shape
//                 if (shape.type === "rect" && orig.type === "rect") {
//                     shape.x = orig.x + dx;
//                     shape.y = orig.y + dy;
//                 } else if (shape.type === "circle" && orig.type === "circle") {
//                     shape.rectX = orig.rectX + dx;
//                     shape.rectY = orig.rectY + dy;
//                 }
//             }

//             transState.activeHandles = generateHandles(shape);
//             clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
//             return;
//         }



//         //@ts-expect-error dfa
//         if(window.shapeType=="rect"){
//             clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
//             ctx.strokeRect(startX,startY,width,height)
//             //@ts-expect-error fads
//         }else if(window.shapeType=="circle"){
//             clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
//             ctx.beginPath();
//             ctx.ellipse( rectX + size / 2, rectY + size / 2, size / 2, size / 2 , 0 ,0 , 2 * Math.PI);
//             ctx.stroke()
//             //@ts-expect-error dfa
//         }else if(window.shapeType=="line"){
//             clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
//             ctx.beginPath()
//             ctx.moveTo(startX,startY)
//             ctx.lineTo(x,y)
//             ctx.stroke()
//             //@ts-expect-error dfa
//         }else if(window.shapeType=="pencil"){
//             strokes.push({
//                 currentX:x-canvasOffsetX,
//                 currentY:y
//             })

//             ctx.lineTo(x-canvasOffsetX,y)
//             ctx.stroke()
//             //@ts-expect-error dfa
//         }else if(window.shapeType=="erase"){
//             console.log("using eraser")
//             const index = eraseAt(EraseX,EraseY,existingShape)
//             console.log(index)
//             if(index!==-1){
//                 existingShape.splice(index,1)
//                 clearCanvas(existingShape,canvas,ctx,scale, offSetX, offSetY)
//             }
//             //@ts-expect-error dfa
//         }else if(window.shapeType=="panning"){
//             const dx=e.clientX-startX;
//             const dy=e.clientY-startY;
//             offSetX+=dx
//             offSetY+=dy
//             startX=e.clientX
//             startY=e.clientY
//             updatePanning()
//         }              
//     }

// })


    canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    const { x, y } = toWorld(e.clientX, e.clientY);

    //@ts-expect-error esfd
    const shapeType = window.shapeType;

    const width = x - startX;
    const height = y - startY;
    const size = Math.min(Math.abs(width), Math.abs(height));
    const rectX = width < 0 ? startX - size : startX;
    const rectY = height < 0 ? startY - size : startY;

    if (shapeType === "select" && transState.isTransforming && transState.selectedShapeIndex !== null) {
        const dx = x - transState.startX;
        const dy = y - transState.startY;
        const shape = existingShape[transState.selectedShapeIndex];
        if(!transState.originalShape) return
        let orig:Shape = shape;
        // const orig:Shape = transState.originalShape;

    if (transState.activeDragHandle) {
    if (transState.activeDragHandle && shape.type === "rect" && orig.type === "rect") {
        let newX = orig.x;
        let newY = orig.y;
        let newWidth = orig.width;
        let newHeight = orig.height;

        //@ts-expect-error fasda
        const { position } =  transState.activeDragHandle;

                // LEFT
        if (position === "left") {
        const delta = x - orig.x;
        newX = x
        newWidth = orig.width - delta;
        }

        // RIGHT
        if (position === "right") {
        newWidth = x - orig.x;
        }

        // TOP
        if (position === "top") {
        const delta = y - orig.y;
        newY = y
        newHeight = orig.height - delta;
        }

        // BOTTOM
        if (position === "bottom") {
        newHeight = y - orig.y;
        }

        // TOP-LEFT
        if (position === "top-left") {
        const dx = x - orig.x;
        const dy = y - orig.y;
        newX = orig.x + dx;
        newY = orig.y + dy;
        newWidth = orig.width - dx;
        newHeight = orig.height - dy;
        }

        // TOP-RIGHT
        if (position === "top-right") {
        const dx = x - (orig.x + orig.width);
        const dy = y - orig.y;
        newY = orig.y + dy;
        newWidth = orig.width + dx;
        newHeight = orig.height - dy;
        }

        // BOTTOM-LEFT
        if (position === "bottom-left") {
        const dx = x - orig.x;
        const dy = y - (orig.y + orig.height);
        newX = orig.x + dx;
        newWidth = orig.width - dx;
        newHeight = orig.height + dy;
        }

        // BOTTOM-RIGHT
        if (position === "bottom-right") {
        const dx = x - (orig.x + orig.width);
        const dy = y - (orig.y + orig.height);
        newWidth = orig.width + dx;
        newHeight = orig.height + dy;
        }

        // Avoid negative width/height
        newWidth = Math.max(10, newWidth);
        newHeight = Math.max(10, newHeight);

        shape.x = newX;
        shape.y = newY;
        shape.width = newWidth;
        shape.height = newHeight;
     }
     clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
    } else {
            orig = transState.originalShape;
                // No handle, just move shape
            if (shape.type === "rect" && orig.type === "rect") {
                shape.x = orig.x + dx;
                shape.y = orig.y + dy;
            } else if (shape.type === "circle" && orig.type === "circle") {
                shape.rectX = orig.rectX + dx;
                shape.rectY = orig.rectY + dy;
            }
        }

        transState.activeHandles = generateHandles(shape);
        clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
        return;
    }

    if (shapeType === "rect") {
        clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
        ctx.strokeRect(startX, startY, width, height);
    } else if (shapeType === "circle") {
        clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
        ctx.beginPath();
        ctx.ellipse(rectX + size / 2, rectY + size / 2, size / 2, size / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (shapeType === "line") {
        clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (shapeType === "pencil") {
        strokes.push({ currentX: x - canvasOffsetX, currentY: y });
        ctx.lineTo(x - canvasOffsetX, y);
        ctx.stroke();
    } else if (shapeType === "erase") {
        const rect = canvas.getBoundingClientRect();
        const EraseX = x - rect.left;
        const EraseY = y - rect.top;
        const index = eraseAt(EraseX, EraseY, existingShape);
        if (index !== -1) {
            existingShape.splice(index, 1);
            clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
        }
    } else if (shapeType === "panning") {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY; 
        offSetX += dx;
        offSetY += dy;
        startX = e.clientX;
        startY = e.clientY;
        updatePanning();
    }           
});

    canvas.addEventListener("mouseup",(e)=>{
        clicked=false

        const {x,y} = toWorld(e.clientX,e.clientY)
        const width=x-startX;
        const height=y-startY;

        const size=Math.min(Math.abs(width),Math.abs(height))

        const rectX = width < 0 ? startX - size : startX;
        const rectY = height < 0 ? startY - size : startY;

        //@ts-expect-error fgnan
        if ( window.shapeType === "select" && transState.isTransforming && transState.selectedShapeIndex !== null){
            const updatedShape = existingShape[transState.selectedShapeIndex];

            console.log(updatedShape)
            existingShape[transState.selectedShapeIndex]=updatedShape
            
            console.log("sented update")
            socket.send(JSON.stringify({
                type:"updateChat",
                message:JSON.stringify({
                    type:"rect",
                    x:updatedShape.x,
                    y:updatedShape.y,
                    height:updatedShape.height,
                    width:updatedShape.width
                }),
                roomId,
                chatId:updatedShape.id
            }))
            transState.isTransforming = false;
            transState.activeDragHandle = null;
            // transState.originalShape = null;
            
            // transState.activeDragHandle = null;

            // transState.isTransforming = false;
            // transState.startX = 0;
            // transState.startY = 0;
            // transState.activeHandles = [];
            // clearCanvas(existingShape, canvas, ctx, scale, offSetX, offSetY);
            // transState.activeHandles = [];

            return 
        }
  

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
                    endX:x,
                    endY:y
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

    //@ts-expect-error fsf
    if(window.shapeType=="select"){
        transState.activeHandles.forEach(h => {
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.arc(h.x, h.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        });
    }

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
   
   const shapes=messages.map((x:{message:string,id:number})=>{
       const messageData=JSON.parse(x.message)
       messageData.id=x.id
       return messageData
    })
    console.log(shapes)
   return shapes
}


