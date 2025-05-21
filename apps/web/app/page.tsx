"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [room, setRoom] = useState("")
  const router=useRouter()
  return (
    <div style={{
      height:"100vh",
      width:"100vw",
      background:"black",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
      }}>
        <div style={{background:'grey',padding:"10px",height:"100px",display:'flex',justifyContent:"center",alignItems:"center",borderRadius:"5px"}}>
          <div>
          <input value={room} onChange={(e)=>setRoom(e.target.value)} type="text"/>
          <button onClick={()=>{
            router.push(`/room/${room}`)
          }}>enter room</button>
          </div>
        </div>
    </div>
  );
}
