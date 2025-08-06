import { useState, FormEvent } from "react";
import { MdEmail } from "react-icons/md";

import TextInput from "../textInput";
import PasswordInput from "../passwordInput";

type Props = {
    signInWithGoogle: () => void;
    handleSignInClick: (email: string, password: string) => void;
}

export default function SignInForm({signInWithGoogle, handleSignInClick}: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function formSubmitHandler(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        handleSignInClick(email, password);
    }

    return (
        <form className="flex flex-col justify-evenly border border-green-500 rounded-2xl p-5 bg-gray-800" onSubmit={formSubmitHandler}>
            <h1>Sign In</h1>
            <TextInput label="Email:" icon={<MdEmail/>} onChange={(e) => setEmail(e.target.value)}/>
            <PasswordInput label="Password" onChange={(e) => setPassword(e.target.value)}/>
            <div className="flex flex-col justify-center items-center pt-5">
                <button type="submit" className="p-3 border rounded-2xl hover:bg-gradient-to-br hover:from-green-500 hover:to-green-950 transition-colors duration-200">Sign In</button>
                <p>or...</p>
                <button
                    type="button"
                    className='flex flex-row justify-evenly items-center rounded-2xl bg-gray-300 shadow-md text-gray-700 w-80 h-10 hover:bg-gray-500 hover:text-white transition-colors duration-200'
                    onClick={signInWithGoogle}
                >
                    <span className="font-medium">Sign in with Google</span>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google icon"
                        className="h-5 w-5"
                    />
                </button>
            </div>
        </form>
    );
}