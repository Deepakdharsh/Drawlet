import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {prismaClient} from "@repo/prisma/client"
import {JWT_SECRET} from "@repo/backend-common/config"

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

wss.on("connection", (ws: WebSocket, request) => {
  const url = request.url;
  if (!url) return;
  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token") || "";
  const decoded = jwt.verify(token,JWT_SECRET);
  //@ts-ignore
  const userId = decoded.id;

  // if(!decoded||!(decoded as JwtPayload).userId){
  if (!decoded || !userId) {
    ws.close();
    return;
  }

  users.push({
    
    userId,
    rooms: [],
    ws,
  });

  ws.on("message",async(data: any) => {
    let parsedData;
    if(typeof data !== "string"){
      parsedData =JSON.parse(data.toString())
    }else{
      parsedData = JSON.parse(data as unknown as string);
    }

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws == ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user.rooms = user?.rooms.filter((x) => x != parsedData.roomId);
    }
/* 
    const {chatId,message}=req.body
    const roomId=Number(req.params.roomId) */

    if (parsedData.type === "updateChat") {
      console.log("entered updateChat")
      console.log(parsedData)
      try {
           await prismaClient.chat.update({
            where:{
                roomId:parsedData.roomId,
                id:parsedData.chatId
            },
            data:{
                message:parsedData.message
            }
      })
      users.forEach((cur) => {
        if (cur.rooms.includes(parsedData.roomId)) {
            cur.ws.send(JSON.stringify({
              type:"updatedChat",
              message:parsedData.message,
              roomId:parsedData.roomId
        }))
        }
      });
      } catch (error) {
        console.log("something went wrong: "+error)
      }    
    }

    if (parsedData.type === "chat") {
      console.log("entered chat")
      try {
          await prismaClient.chat.create({
            data:{
                message:parsedData.message,
                roomId:parsedData.roomId,
                userId
            }
        })
      users.forEach((cur) => {
        if (cur.rooms.includes(parsedData.roomId)) {
            cur.ws.send(JSON.stringify({
              type:"chat",
              message:parsedData.message,
              roomId:parsedData.roomId
        }))
        }
      });
      } catch (error) {
        console.log("something went wrong: "+error)
      }    
    }
  });
});

/*

    {
        ws:WebSocket
        rooms:string[]
        userId:string
    },

    {
        type:"join_room",
        roomId
    },

    {
        type:"leave_room",
        roomId
    },

    {
        type:"chat",
        roomId,
        message
    },


}
*/

