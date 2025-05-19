import  jwt  from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config"

//@ts-ignore
export const generateAccessToken=(user)=>{
    const token=jwt.sign({id:user.id},JWT_SECRET,{expiresIn:"15m"})
    return token
}

//@ts-ignore
export const generateRefreshToken=(user)=>{
    const refreshToken=jwt.sign({id:user._id},JWT_SECRET,{expiresIn:"7d"})
    return refreshToken
}