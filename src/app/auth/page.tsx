'use client'
import { withProvider } from "@/config/authorisation";
import { googleProvider, auth } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import { useState } from "react";

import SignInForm from "@/components/auth/signIn/signInForm";
import SignUpForm from "@/components/auth/signUp/signUpForm";

export default function Auth() {
    const [isSignIn, setIsSignIn] = useState(true);
    const router = useRouter();
    // boom
    async function signInWithProvider() {
        const user = await withProvider(googleProvider);
        if (user) {
            const uid = user.user.uid;
            let username = user.user.displayName;

            const checkRes = await fetch(`/api/auth/checkUser?uid=${uid}`);
            const checkData = await checkRes.json();

            if (checkData.exists) {
                router.replace("/");
            } else {
                const usernameRes = await fetch(`/api/auth/signUp?username=${username}`);
                const usernameData = await usernameRes.json();

                username = usernameData.username; 

                const postBody = {
                    uid: uid,
                    username: username,
                    displayName: user.user.displayName,
                    email: user.user.email,
                };

                const response = await fetch("/api/auth/signUp", {
                    method: "POST",
                    body: JSON.stringify(postBody),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok)
                    router.replace("/");
            }
        } else {
            console.error("Something broke ig");
        }
    }

    async function signInManual(email: string, password: string) {

    }

    async function signUpManual(username: string, email: string, password: string) {

    }

    return (
        <div className="relative flex justify-center w-full h-full pt-20">
            <div className={`w-[30%] absolute ${isSignIn ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} transition-opacity duration-700`}>
                <SignInForm signInWithGoogle={signInWithProvider} handleSignInClick={signInManual}/>
                <p onClick={() => setIsSignIn(!isSignIn)} className="hover:text-green-500 hover:underline hover:cursor-pointer">Don't have an account?</p>
            </div>

            <div className={`w-[30%] absolute ${isSignIn ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"} transition-opacity duration-700`}>
                <SignUpForm handleSignUpClick={signUpManual}/>
                <p onClick={() => setIsSignIn(!isSignIn)} className="hover:text-green-500 hover:underline hover:cursor-pointer">Already have an account?</p>
            </div>
        </div>
    );
}