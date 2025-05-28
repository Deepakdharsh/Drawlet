import { api } from "@/api/axios"
import Canvas from "@/components/Canvas"

export default async function canvas({params}:{
    params:{
        roomId:string
    }
}){
    const {roomId}=await (params)
    console.log(roomId)
    const res=await api.get(`/chat/room/${roomId}`)
    const room=res.data.id
   return <Canvas roomId={room}/>
}