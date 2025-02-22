"use client";
import React from "react";
import {UserAddOutlined, LockOutlined} from "@ant-design/icons"
import Swal from "sweetalert2";
import { auth } from "../../../firebase-config";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import Loading from "@/components/Loading";
import GradientTextDefault from "@/components/GradientTextDefault";
import ShinyText from "@/components/ShinyText";

export default function Login() {
  const [email, setEmail] = React.useState<string>("");
  const [paswd, setPaswd] = React.useState<string>("");
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  
async function handleLogin(){
      if(email.length < 4 && paswd.length < 4){ return; }
      try {
        setIsLoading(true);
          signInWithEmailAndPassword(auth, email, paswd).then( async (users) => {
            const response = users.user.uid;
            const Token = await users.user.getIdToken();
            if(response && Token){
                fetch('/api/login', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                      },
                    body: JSON.stringify({
                        email: email,
                        sameSite: 'Strict',
                        uid: response,
                        token: Token,
                    })
                }).then((res) => {
                    if(res.status === 200){
                        Swal.fire({
                          icon: 'success',
                          title: "Login Success",
                          text: "Welcome Aboard",
                          timer: 2000,
                          showConfirmButton: false,
                        }).then(() => {
                          router.push('/')
                        })
                    }else {
                        Swal.fire({
                            icon: 'error',
                            title: "Login Failure",
                            text: `@${res.status}:${res.text}`,
                            timer: 2000,
                        })
                        setIsLoading(false)
                    }
                  setIsLoading(false)
                })
            }else {
                Swal.fire({
                  icon: "error",
                  title: "Wrong Username & Passwords",
                  text: "Please check your username and password and try again." 
                })
                setIsLoading(false)
            }
        }).catch(() => {
            Swal.fire({
              icon: "error",
              title: "Wrong Username & Password",
              text: `Please check your username and password and try again.` 
            })
            setIsLoading(false)
        })
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  if(isLoading){
    return <Loading />
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <form className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
            <GradientTextDefault
            colors={["#1a1a1a", "#4079ff", "#1a1a1a", "#4079ff", "#1a1a1a"]}
            animationSpeed={3}
            showBorder={false}
            className="">LOGIN</GradientTextDefault></h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            <UserAddOutlined/> Username 
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="Username"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
           <LockOutlined/> Password  
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            onChange={(e) => setPaswd(e.target.value.toLowerCase())}
            placeholder="******************"
            required
          />
        </div>
        <div className="flex items-center justify-between">
            <button
                className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => handleLogin()}
                >
            <ShinyText text="Sign In!" disabled={false} speed={3} className="text-black-100" />
            </button>
        </div>
      </form>
    </div>
  );
}