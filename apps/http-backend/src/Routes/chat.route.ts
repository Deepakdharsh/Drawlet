import express from "express";
import { chat, getRoomId, joinRoom } from "../controller/chat.controller";
import { auth } from "../middleware/auth.middleware";
const chatRouter=express.Router()

//@ts-ignore
chatRouter.post("/room",auth,joinRoom)
//@ts-ignore
chatRouter.get("/:roomId",auth,chat)
//@ts-ignore
chatRouter.get("/:slug",auth,getRoomId)

export {chatRouter}