"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/config/userProvider";

export default function Index() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth");
      } else if (!user.emailVerified) {
        router.replace("/unauthorised");
      } else {
        router.push("/home");
      }
    }
  }, [user, loading, router]);
  
  return loading ? <p>Loading...</p> : null;
}