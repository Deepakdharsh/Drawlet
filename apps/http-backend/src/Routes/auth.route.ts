import express from "express"
import { signin, signup } from "../controller/auth.controller"
const authRouter=express.Router()

//@ts-ignore
authRouter.post("/signin",signin)
//@ts-ignore
authRouter.post("/signup",signup)

export  {authRouter}