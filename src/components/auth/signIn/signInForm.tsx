import { useState, FormEvent } from "react";
import { MdEmail } from "react-icons/md";
import NeonButton from "../../neonButton";
import TextInput from "../textInput";
import PasswordInput from "../passwordInput";

type Props = {
  signInWithGoogle: () => void;
  handleSignInClick: (email: string, password: string) => void;
};

export default function SignInForm({
  signInWithGoogle,
  handleSignInClick,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function formSubmitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSignInClick(email, password);
  }

  return (
    // wrap the fram in neon rings called from globals.css
    <div className="neon-ring">
      <i style={{ "--clr": "#00ffc3" } as React.CSSProperties}></i>
      <i style={{ "--clr": "#00e6b3" } as React.CSSProperties}></i>
      <i style={{ "--clr": "#00ffdd" } as React.CSSProperties}></i>
      {/* #222/80 controls opacity, decreasing denom makes it more transparent */}
      <form
        className="relative w-[300px] p-8 rounded-lg shadow-xl text-white
             bg-black/30 backdrop-blur-md border border-white/10"
        onSubmit={formSubmitHandler}
      >
        <h1 className="text-2xl text-[#00ffc3] tracking-wide mb-6 text-center">
          Sign In
        </h1>
        <TextInput
          label="Email:"
          icon={<MdEmail />}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-center w-full mt-4">
          <NeonButton type="submit">SIGN IN</NeonButton>
        </div>
      </form>
    </div>
  );
}
