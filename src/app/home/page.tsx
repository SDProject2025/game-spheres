import { auth } from "@/config/firebaseConfig"

export default function Home() {
    const user = auth.currentUser;
    return <p>Welcome {user?.email}! Matcha pilates in bali before a labubu rave</p>
}