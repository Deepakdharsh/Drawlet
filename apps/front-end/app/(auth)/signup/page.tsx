"use client"
import Auth from "@/components/Auth";
import Input from "@/components/Input";
import { useRouter } from "next/navigation";
import { forwardRef, useRef } from "react";

const ForwardedRef=forwardRef(Input)

export default function Signup(){
    const router=useRouter()
    const emailRef=useRef<HTMLInputElement>(null)
    const passwordRef=useRef<HTMLInputElement>(null)

    function handleClick(){
         console.log(
            emailRef?.current?.value,
            passwordRef?.current?.value,
        )
        router.push("/")
    }
    return <Auth title={"signup"}>
        <ForwardedRef ref={emailRef} type="text" placeholder={"email"}/>
        <ForwardedRef ref={passwordRef} type="password" placeholder={"password"}/>
        <button onClick={handleClick} className="bg-red-200 py-2 px-4 rounded-sm mt-3">Submin</button>
    </Auth>
}