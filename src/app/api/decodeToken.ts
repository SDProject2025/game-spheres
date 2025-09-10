import { auth } from "@/config/firebaseAdminConfig";

export async function decodeToken(authHeader: string) {
  // Necessary as authHeader comes in form:
  // Authorization: "Bearer [token]"
  const token = authHeader.split("Bearer ")[1] as string;
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid token";
    console.error(message);
    return undefined;
  }
}