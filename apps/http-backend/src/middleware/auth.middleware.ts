import { prismaClient } from "@repo/prisma/client"
import { Request,Response,NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"


export const auth=async(req:Request,res:Response,next:NextFunction)=>{
    // try {
    //     const token=req.cookies.token 
    //     const refreshToken=req.cookies.refreshToken 
        
    //     if(!token&&!refreshToken){
    //         return res.status(401).json({
    //             message:'session expired'
    //         })
    //     }
        
    //     const decoded = await jwt.verify(token,JWT_SECRET)
    //     //@ts-ignore
    //     req.userId=decoded.id
    //     next()
        
    //     // if(!token) return res.status(400).json({message:"invaild token"})
        
    //     // if(token&&decoded){
    //         //     return next()
    //         // }
    //         // //@ts-ignore
    //         // const isAuthorized=await prismaClient.user.findFirst({where:{id:decoded.id}})
    //         // if(!isAuthorized){
    //             //     return res.status(401).json({
    //                 //         message:"invaild token format"
    //                 //     })
    //                 // }else{
                        
    //                 // }
    //     } catch (error) {
    //         try {
    //         const refreshToken=req.cookies.refreshToken 
    //         const decodedRefreshToken=await jwt.verify(refreshToken,JWT_SECRET)
    //         //@ts-ignore
    //         const newToken=jwt.sign({id:decodedRefreshToken.id})

    //         res.cookie("token",newToken,{
    //             httpOnly:true,
    //             secure:process.env.NODE_ENV == "production" ? true : false,
    //             sameSite:"strict",
    //             maxAge:15*60*1000
    //         })
    //         //@ts-ignore
    //         req.userId=decodedRefreshToken.id
    //         next()
    //     } catch (error) {
    //          console.log(error)
    //         res.status(500).json({
    //             message:'something went wrong'
    //         })
    //    }
    // }
    try {
        // const token=req.headers.token
        const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJjZDIxY2RkLWZjZmEtNGZlNi04NGE5LTg3Y2E0OWJmODQyNSIsImlhdCI6MTc1MzMwNzYxMywiZXhwIjoxNzUzOTEyNDEzfQ.iHO2IanQ_XjgzdWRgqBicNsICj-Vq7THH8oAktaKdpw"
        if(token){
            //@ts-ignore
            const decoded=jwt.verify(token,JWT_SECRET)
            // console.log(decoded,"from the auth middleware")
            if(!decoded){
                return res.status(401).json({
                    message:"invaild token"
                })
            }
            //@ts-ignore
            req.userId=decoded.id
            next()
                
        }else{
            return res.status(401).json({
                message:"invaild token"
            })
        }
    } catch (error) {
        //@ts-ignore
        console.log(`Error in Auth middleware ${error.message}`)
        res.status(401).json({
            message:"Internal server error"
        })
    }
}
