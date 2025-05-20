import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
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
  console.log(url)
  if (!url) return;
  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token") || "";
  const decoded = jwt.verify(token,JWT_SECRET);
  //@ts-ignore
  const userId = decoded.id;
  console.log(userId)

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
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws == ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user.rooms = user?.rooms.filter((x) => x != parsedData.roomId);
    }

    if (parsedData.type === "chat") {
        await prismaClient.chat.create({
            data:{
                message:parsedData.message,
                roomId:parsedData.roomId,
                userId
            }
        })
      users.forEach((cur) => {
        if (cur.rooms.includes(parsedData.roomId)) {
            cur.ws.send(JSON.stringify(parsedData.message))
        }
      });
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
