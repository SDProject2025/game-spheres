"use client";
import { withProvider } from "@/config/authorisation";
import { googleProvider, auth } from "@/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  validatePassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

import SignInForm from "@/components/auth/signIn/signInForm";
import SignUpForm from "@/components/auth/signUp/signUpForm";

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  async function signInWithProvider() {
    await toast.promise(
      (async () => {
        const user = await withProvider(googleProvider);
        if (!user) throw new Error("Authentication failed");

        const uid = user.user.uid;
        let username = user.user.displayName;

        const checkRes = await fetch(`/api/auth/checkUser?uid=${uid}`);
        const checkData = await checkRes.json();

        if (checkData.exists) {
          router.replace("/");
          return;
        }

        const usernameRes = await fetch(
          `/api/auth/signUp/withProvider?username=${username}`
        );
        const usernameData = await usernameRes.json();
        username = usernameData.username;

        const postBody = {
          uid,
          username,
          displayName: user.user.displayName,
          email: user.user.email,
        };

        const response = await fetch("/api/auth/signUp/withProvider", {
          method: "POST",
          body: JSON.stringify(postBody),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to save user");
        router.replace("/");
      })(),
      {
        loading: "Signing in with Google...",
        success: "Signed in successfully!",
        error: (err) => err.message || "Error signing in",
      }
    );
  }

  async function signInManual(email: string, password: string) {
    await toast.promise(
      signInWithEmailAndPassword(auth, email, password).then((user) => {
        router.replace("/");
        return user;
      }),
      {
        loading: "Signing in...",
        success: "Successfully signed in!",
        error: (err) => err.message || "Error signing in",
      }
    );
  }

  async function signUpManual(
    username: string,
    displayName: string,
    email: string,
    password: string
  ) {
    await toast.promise(
      (async () => {
        const user = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (!user) throw new Error("User creation failed");

        const uid = user.user.uid;

        const checkRes = await fetch(`/api/auth/checkUser?uid=${uid}`);
        if (!checkRes.ok) throw new Error("Failed to check user existence");
        const checkData = await checkRes.json();

        if (checkData.exists) {
          router.replace("/");
          return;
        }

        const postBody = {
          uid,
          username,
          displayName,
          email,
        };

        const response = await fetch("/api/auth/signUp/manual", {
          method: "POST",
          body: JSON.stringify(postBody),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to save user profile");

        await sendEmailVerification(user.user);

        router.replace("/");
      })(),
      {
        loading: "Signing up...",
        success:
          "Account created successfully! Please check your email for verification.",
        error: (err) => err.message || "Sign-up failed. Please try again.",
      }
    );
  }

  async function isValidUsername(username: string) {
    try {
      const result = await toast.promise(
        async () => {
          const res = await fetch(
            `/api/auth/signUp/manual?username=${username}`
          );
          if (!res.ok) throw new Error("Username already taken");
          return true;
        },
        {
          loading: "Checking username availability...",
          success: "Username available",
          error: "Username already taken",
        }
      );

      return result; // true if available
    } catch {
      return false; // false if not available
    }
  }

  async function isValidPassword(password: string) {
    try {
      const status = await validatePassword(auth, password);
      if (status.isValid) return true;
      toast.error("Invalid password");
      return false;
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Unknown error during password validation";
      toast.error(`Password validation failed: ${message}`);
      return false;
    }
  }

  return (
    <div className="relative flex justify-center w-full h-full pt-20">
      <div
        className={`w-[30%] absolute ${
          isSignIn
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } transition-opacity duration-700 flex flex-col items-center`}
      >
        <SignInForm
          signInWithGoogle={signInWithProvider}
          handleSignInClick={signInManual}
          bottomLink={
            <p
              onClick={() => setIsSignIn(false)}
              className="mt-4 text-center text-sm text-[#00ffc3] font-medium
                 hover:text-[#00ffdd] hover:cursor-pointer
                 drop-shadow-[0_0_10px_#00ffc3]"
            >
              Don&apos;t have an account?
            </p>
          }
        />
      </div>

      <div
        className={`w-[30%] absolute ${
          isSignIn
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto"
        } transition-opacity duration-700 flex flex-col items-center`}
      >
        <SignUpForm
          handleSignUpClick={signUpManual}
          validateUsername={isValidUsername}
          validatePassword={isValidPassword}
          bottomLink={
            <p
              onClick={() => setIsSignIn(!isSignIn)}
              className="mt-4 text-center text-sm text-[#00ffc3] font-medium
                 hover:text-[#00ffdd] hover:cursor-pointer
                 drop-shadow-[0_0_10px_#00ffc3]"
            >
              Already have an account?
            </p>
          }
        />
      </div>

      <Toaster />
    </div>
  );
}
