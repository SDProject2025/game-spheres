import { auth } from "@/config/firebaseConfig"

export default function Home() {
    const user = auth.currentUser;
    return <p>Welcome! Matcha pilates in bali before a labubu rave</p>
}