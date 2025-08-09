"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth");
      } else if (user.emailVerified) {
        router.replace("/home");
      } else {
        router.replace("/unauthorised");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return loading ? <p>Loading...</p> : null;
}