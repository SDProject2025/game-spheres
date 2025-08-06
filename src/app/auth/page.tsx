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

    async function signInWithProvider() {
        const user = await withProvider(googleProvider);
        if (user) {
            router.replace("/");        
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