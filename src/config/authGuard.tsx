"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/config/userProvider";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const publicPaths = ["/auth", "/unauthorised", "/landing"];

  useEffect(() => {
    if (!loading) {
      const path = window.location.pathname;
      if (!publicPaths.includes(path)) {
        if (!user) {
          router.replace("/auth");
        } else if (!user.emailVerified) {
          router.replace("/unauthorised");
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Loading...</p>; // global loading state
  }

  return <>{children}</>;
}
