import { auth } from "@/config/firebaseAdminConfig";

export async function decodeToken(authHeader: string) {
  // Necessary as authHeader comes in form:
  // Authorization: "Bearer [token]"
  const token = authHeader.split("Bearer ")[1] as string;
  const decoded = await auth.verifyIdToken(token);

  // Possibly redundant, but allows for more explicit handling on caller
  return decoded ? decoded : undefined;
}
