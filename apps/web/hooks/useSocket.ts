import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";


export function useSocket(){
    const [socket,setSocket]=useState<WebSocket>()

    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=`)
        ws.onopen=()=>{
            setSocket(ws)
        }

        return ()=>{
            ws.close()
        }
    },[])

    return {socket}
}