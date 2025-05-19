import express from "express"
import cookieParser from "cookie-parser"
import { authRouter } from "./Routes/auth.route"
import { chatRouter } from "./Routes/chat.route"
const app=express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/chat",chatRouter)


app.listen(3001,()=>{
    console.log("server has started on port 3002")
})