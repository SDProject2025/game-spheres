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
        // wrap the fram in neon rings called from globals.css
      <div className="neon-rings-wrapper">
        <div className="neon-ring neon-ring-1"></div>
        <div className="neon-ring neon-ring-2"></div>
        <div className="neon-ring neon-ring-3"></div>
        {/* #222/80 controls opacity, decreasing denom makes it more transparent */}
        <form
          className="relative w-[300px] p-8 bg-[#222]/80 text-white rounded-lg shadow-xl" onSubmit={formSubmitHandler}>
          <h1 className="text-2xl text-[#00ffc3] tracking-wide mb-6 text-center">Sign In</h1>
          <TextInput label="Email:" icon={<MdEmail />} onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput label="Password" onChange={(e) => setPassword(e.target.value)} />
          <div className="flex flex-col justify-center items-center pt-5">
            <button
              type="submit"
              className="w-full py-2 mt-4 bg-[#00ffc3] text-[#111] font-semibold rounded-md shadow-[0_0_15px_#00ffc3] hover:bg-[#00e6b3] transition"
            >
              Sign In
            </button>

            {/* <p>or...</p> */}
            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-4 flex items-center justify-between gap-4 px-4 py-2 w-full rounded-md bg-gray-300 text-gray-800 shadow hover:bg-gray-500 hover:text-white transition"
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
      </div>
    );
}