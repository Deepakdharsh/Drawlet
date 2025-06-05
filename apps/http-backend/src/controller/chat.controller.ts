import { Request, Response } from "express"
import { CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from "@repo/prisma/client"


const createRoom=async(req:Request,res:Response)=>{
    try {
        //@ts-ignore
        const userId=req.userId
        const {data,error}=CreateRoomSchema.safeParse(req.body)
    console.log(data)
        if(error) return res.status(409).json({message:'invaild inputs'})
        
        const isRoomExist=await prismaClient.room.findFirst({where:{slug:data.name}})
    
        if(isRoomExist){
            return res.status(409).json({
                message:"room already exists"
            })
        }
    
        const room=await prismaClient.room.create({
            data:{
            slug:data.name,
            adminId:userId
        }})
    
        if(!room) return res.status(409).json({message:"something went wrong"})
    
        
        res.json({
            message:"room created",
            room
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

const chat=async(req:Request,res:Response)=>{
    try {
        //@ts-ignore
        const userId=req.userId
        const roomId=Number(req.params.roomId)
    
        const chats=await prismaClient.chat.findMany({
            where:{
                roomId:roomId
            },
            orderBy:{
                id:'desc'
            },
            // take:50
        })
    
        if(!chats) return res.status(409).json({message:"something went wrong"})
    
        
        res.json({
            message:"room created",
            chats
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

const getRoomId=async(req:Request,res:Response)=>{
    try {
        //@ts-ignore
        const roomId=req.params.slug
        console.log(roomId,typeof roomId)
        const room=await prismaClient.room.findFirst({
            where:{slug:roomId}
        })
        // const room=await prismaClient.room.findMany()

        console.log(room)
    
        if(!room) return res.status(409).json({message:"something went wrong"})
    
        
        res.json({
            message:"room created",
            id:room.id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

export {createRoom,chat,getRoomId}