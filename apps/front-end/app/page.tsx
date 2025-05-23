"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {
  const [room,setRoom]=useState("")
  const router=useRouter()
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    {/* <div className="bg-amber-50 h-screen"> */}
      <div>
        <input type="text" value={room} onChange={(e)=>setRoom(e.target.value)} className="outline-none border rounded-md mr-2" placeholder="enter your room"/>
        <button onClick={()=>router.push(`/room/${room}`)} className="bg-gray-50 rounded text-black">Join room</button>
      </div>
    </div>
  );
}
