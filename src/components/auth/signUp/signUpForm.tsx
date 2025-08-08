import { useState, FormEvent } from "react";
import { MdPerson, MdEmail } from "react-icons/md";
import NeonButton from "../../neonButton";
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
  <div className="neon-ring">
    <i style={{ "--clr": "#00ffc3" } as React.CSSProperties}></i>
    <i style={{ "--clr": "#00e6b3" } as React.CSSProperties}></i>
    <i style={{ "--clr": "#00ffdd" } as React.CSSProperties}></i>

    <form
      className="relative w-[300px] p-8 rounded-lg shadow-xl text-white
                 bg-black/30 backdrop-blur-md border border-white/10"
      onSubmit={formSubmitHandler}
    >
      <h1 className="text-2xl text-[#00ffc3] tracking-wide mb-6 text-center">
        Sign Up
      </h1>

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

      <div className="flex justify-center w-full mt-4">
        <NeonButton type="submit" >SIGN UP</NeonButton>
      </div>
    </form>
  </div>
);

}