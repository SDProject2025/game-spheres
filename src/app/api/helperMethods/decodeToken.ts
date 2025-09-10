import { auth } from "@/config/firebaseAdminConfig";

export async function decodeToken(authHeader: string) {
  const token = authHeader.split('Bearer ')[1] as string;
  const decoded = await auth.verifyIdToken(token);
  return decoded ? decoded : undefined;
}