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
    <div className="neon-rings-wrapper-blue">
      <div className="neon-ring-blue neon-ring-blue-1"></div>
      <div className="neon-ring-blue neon-ring-blue-2"></div>
      <div className="neon-ring-blue neon-ring-blue-3"></div>
      <form
        className="relative w-[300px] p-8 bg-[#222]/20 text-white rounded-lg shadow-xl" onSubmit={formSubmitHandler}>
        <h1 className="text-2xl text-[#3b82f6] tracking-wide mb-6 text-center">Sign Up</h1>
        <TextInput
          label="Username:"
          icon={<MdPerson />}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextInput
          label="Email:"
          icon={<MdEmail />}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput label="Password:" onChange={(e) => setPassword(e.target.value)} />

        <div className="flex flex-col justify-center items-center pt-5">
          <button
            type="submit"
            className="w-full py-2 mt-4 bg-[#3b82f6] text-[#111] font-semibold rounded-md shadow-[0_0_15px_#3b82f6] hover:bg-[#2563eb] transition"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}