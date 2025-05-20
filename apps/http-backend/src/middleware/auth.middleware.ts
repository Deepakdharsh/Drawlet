import { prismaClient } from "@repo/prisma/client"
import { Request,Response,NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"


export const auth=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token=req.headers.token 
    
        if(!token) return res.status(400).json({message:"invaild token"})
        //@ts-ignore
        const decoded = await jwt.verify(token,JWT_SECRET)
        const isAuthorized=await prismaClient.user.findFirst({where:{id:decoded.id}})
        if(!isAuthorized){
            return res.status(401).json({
                message:"invaild token format"
            })
        }else{
            //@ts-ignore
            req.userId=decoded.id
            next()
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'something went wrong'
        })
    }
}