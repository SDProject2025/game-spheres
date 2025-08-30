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
    // wrap the frame in neon rings called from globals.css
    <div className="neon-ring">
      <i style={{ "--clr": "#00ffd5ff" } as React.CSSProperties}></i>
      <i style={{ "--clr": "#0f939aff" } as React.CSSProperties}></i>
      <i style={{ "--clr": "#03bf93ff" } as React.CSSProperties}></i>
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
          id="email"
          label="Email:"
          icon={<MdEmail />}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          id="password"
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex flex-col items-center justify-center w-full mt-4 gap-4 max-w-sm mx-auto">
          <NeonButton type="submit">SIGN IN</NeonButton>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 px-4 py-2 w-full max-w-xs rounded-md bg-black-300 text-gray-800 hover:text-white transition"
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
