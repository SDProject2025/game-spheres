import { useState, FormEvent } from "react";
import { MdEmail } from "react-icons/md";
import NeonButton from "../../neonButton";
import TextInput from "../textInput";
import PasswordInput from "../passwordInput";

type Props = {
  signInWithGoogle: () => void;
  handleSignInClick: (email: string, password: string) => void;
  bottomLink?: React.ReactNode;
};

export default function SignInForm({
  signInWithGoogle,
  handleSignInClick,
  bottomLink,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function formSubmitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSignInClick(email, password);
  }

  return (
    <div className="flex justify-center">
      <div className="neon-ring">
        <i style={{ "--clr": "#00ffd5ff" } as React.CSSProperties}></i>
        <i style={{ "--clr": "#0f939aff" } as React.CSSProperties}></i>
        <i style={{ "--clr": "#03bf93ff" } as React.CSSProperties}></i>
        {/* #222/80 controls opacity, decreasing denom makes it more transparent */}
        <form
          className="relative w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 rounded-lg shadow-xl text-white
                     bg-black/30 backdrop-blur-md border border-white/10"
          onSubmit={formSubmitHandler}
        >
          <h1 className="text-xl sm:text-2xl text-[#00ffc3] tracking-wide mb-6 text-center">
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
          <div className="flex flex-col sm:flex-row items-center justify-center w-full mt-4 gap-4 max-w-sm mx-auto">
            <NeonButton type="submit">SIGN IN</NeonButton>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-3 px-3 sm:px-4 py-2 w-full sm:w-auto max-w-xs rounded-md bg-black-300 text-gray-800 hover:text-white transition"
            >
              <span className="font-medium">Sign in with Google</span>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google icon"
                className="h-5 w-5"
              />
            </button>
          </div>
            {bottomLink && (
    <div className="mt-6 text-center text-sm sm:text-base text-[#00ffc3] font-medium drop-shadow-[0_0_10px_#00ffc3]">
      {bottomLink}
    </div>
  )}
        </form>
      </div>
    </div>
  );
}
