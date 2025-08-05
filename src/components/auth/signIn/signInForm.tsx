import { useState } from "react";

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="flex-col">
            <h1>Sign In</h1>
            <span>
                <p>Email Address:</p>
                <input type="text" onChange={(e) => setEmail(e.target.value)}/>
            </span>
            <span>
                <p>Password:</p>
                <input type="text" onChange={(e) => setPassword(e.target.value)}/>
            </span>
        </div>
    );
}