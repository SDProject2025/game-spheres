'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authState = onAuthStateChanged(auth, user => {
      if (!user) router.replace("/auth");
      else router.replace("/home");
      setLoading(false);
    });

    return () => authState();
  }, []);

  return loading ? <p>Loading</p> : null;
}