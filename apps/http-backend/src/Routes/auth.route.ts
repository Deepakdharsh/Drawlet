import express from "express"
import { logout, signin, signup } from "../controller/auth.controller"
const authRouter=express.Router()

//@ts-ignore
authRouter.post("/signin",signin)
//@ts-ignore
authRouter.post("/signup",signup)
//@ts-ignore
authRouter.post("/logout",logout)

export  {authRouter}