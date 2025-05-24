import { Canvas } from "@/components/Canvas"

export default async function canvas({params}:{
    params:{
        roomId:string
    }
}){
    const roomId=await (params).roomId
   return  <Canvas roomId={roomId}/>
}