import { useState, FormEvent } from "react";
import { MdPerson, MdEmail } from "react-icons/md";

import TextInput from "../textInput";
import PasswordInput from "../passwordInput";

type Props = {
    handleSignUpClick: (username: string, email: string, password: string) => void;
}

export default function SignUpForm({handleSignUpClick}: Props) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function formSubmitHandler(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        handleSignUpClick(username, email, password);
    }
    
    return (
        <form className="flex-col justify-evenly border border-green-500 rounded-2xl p-5 bg-gray-800" onSubmit={formSubmitHandler}>
            <h1>Sign Up</h1>
            <TextInput label="Username:" icon={<MdPerson/>} onChange={(e) => setUsername(e.target.value)}/>
            <TextInput label="Email:" icon={<MdEmail/>} onChange={(e) => setEmail(e.target.value)}/>
            <PasswordInput label="Password:" onChange={(e) => setPassword(e.target.value)}/>

            <div className="flex flex-col justify-center items-center pt-5">
                <button type="submit" className="p-3 border rounded-2xl hover:bg-gradient-to-br hover:from-green-500 hover:to-green-950 transition-colors duration-200">Sign Up</button>
            </div>
        </form>
    );
}