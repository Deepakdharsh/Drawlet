import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import { authRouter } from "./Routes/auth.route"
import { chatRouter } from "./Routes/chat.route"

const app=express()


app.use(cors({
    origin:["http://localhost:3001"],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/chat",chatRouter)


app.listen(3005,()=>{
    console.log("server has started on port 3001")
})