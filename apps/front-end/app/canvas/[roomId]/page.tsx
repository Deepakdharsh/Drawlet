import { api } from "@/api/axios"
import { RoomCanvas } from "@/components/RoomCanvas"

export default async function canvas({params}:{
    params:{
        roomId:string
    }
}){
    const {roomId}=await (params)
    const res=await api.get(`/chat/room/${roomId}`)
    const room=res.data.id
   return  <RoomCanvas roomId={room}/>
}