import express from "express";
import { chat, getRoomId, createRoom } from "../controller/chat.controller";
import { auth } from "../middleware/auth.middleware";
const chatRouter=express.Router()

//@ts-ignore
chatRouter.post("/room",auth,createRoom)
//@ts-ignore
chatRouter.get("/:roomId",auth,chat)
//@ts-ignore
chatRouter.get("/room/:slug",auth,getRoomId)

export {chatRouter}