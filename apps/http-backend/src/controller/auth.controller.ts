import { Request, Response } from "express"
import {CreateUserSchema,signinSchema} from "@repo/common/types"
import {prismaClient} from "@repo/prisma/client"
import bcrypt from "bcrypt"
import { generateAccessToken, generateRefreshToken } from "../utils/helper"


const signin=async(req:Request,res:Response)=>{
    try {
        const {error,data}=signinSchema.safeParse(req.body)
    
        if(error){
            console.log(error)
            return res.status(411).json({message:"invaild inputs"})
        }
    
        const user=await prismaClient.user.findFirst({where:{email:data.email}})

    
        if(!user){
            return res.status(401).json({ 
                message:"invaild credentails"
            })
        }
    
        const isMatch=await bcrypt.compare(data.password,user.password)

    
        if(!isMatch){
            return res.status(403).json({
                message:"invaild credentails"
            })
        }
    
        const token=generateAccessToken(user)
        const refreshToken=generateRefreshToken(user)
    
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV == "production" ? true : false,
            sameSite:"strict"
        })
    
        res.status(201).json({
            message:"login successful",
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

const signup=async(req:Request,res:Response)=>{
    try {
        const {data,error}=CreateUserSchema.safeParse(req.body)
    
        if(error){
            return res.json(411).json({
                message:"invaild inputs"
            })
        }
    
        const user = await prismaClient.user.findFirst({where:{email:data.email}})
    
        if(user){
            return res.status(409).json({
                message:"user already exists"
            })
        }
    
        const hashedPassword=await bcrypt.hash(data.password,10)
        
        const newUser=await prismaClient.user.create({
            data:{
                email:data.email,
                name:data.username,
                password:hashedPassword,
            }
        })
    
        if(!newUser){
            return res.status(409).json({
                message:"something went wrong"
            })
        }
    
        const token=generateAccessToken(newUser)
        const refreshToken=generateRefreshToken(newUser)
    
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV == "production" ? true : false,
            sameSite:"strict"
        })
    
        res.status(201).json({
            message:"user created",
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}
export {signin,signup}