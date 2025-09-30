import { useState, FormEvent, useEffect } from "react";
import { MdPerson, MdEmail } from "react-icons/md";

import NeonButton from "../../neonButton";
import TextInput from "../textInput";
import PasswordInput from "../passwordInput";

type Props = {
  handleSignUpClick: (
    username: string,
    displayName: string,
    email: string,
    password: string
  ) => void;
  validateUsername: (username: string) => Promise<boolean>;
  validatePassword: (password: string) => Promise<boolean>;
  signInWithGoogle: () => void;
  bottomLink?: React.ReactNode;
};

export default function SignUpForm({
  signInWithGoogle,
  handleSignUpClick,
  validateUsername,
  validatePassword,
  bottomLink,
}: Props) {
  // REQUIRED FIELDS
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // VALIDATION FIELDS
  const [validEmail, setValidEmail] = useState(true);
  const [validUsername, setValidUsername] = useState(true);
  const [validPassword, setValidPassword] = useState(true);

  function validateEmail() {
    if (email === "") return false;
    const re = new RegExp("^[\\w.-]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    return re.test(email);
  }

  async function handleUsernameChange() {
    setValidUsername(await validateUsername(username));
  }

  async function handlePasswordValidation() {
    setValidPassword(await validatePassword(password));
  }

  useEffect(() => {
    if (!username) return;

    const timeout = setTimeout(() => {
      handleUsernameChange();
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  useEffect(() => {
    if (!password) return;

    const timeout = setTimeout(() => {
      handlePasswordValidation();
    }, 500);

    return () => clearTimeout(timeout);
  }, [password]);

  async function formSubmitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      (await validateUsername(username)) &&
      (await validatePassword(password))
    ) {
      handleSignUpClick(username, displayName, email, password);
    } else {
    }
  }

  return (
    <div className="flex justify-center">
      <div className="neon-ring">
        <i style={{ "--clr": "#00ffc3" } as React.CSSProperties}></i>
        <i style={{ "--clr": "#00e6b3" } as React.CSSProperties}></i>
        <i style={{ "--clr": "#00ffdd" } as React.CSSProperties}></i>

        <form
          className="relative w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 rounded-lg shadow-xl text-white
                     bg-black/30 backdrop-blur-md border border-white/10"
          onSubmit={formSubmitHandler}
        >
          <h1 className="text-xl text-[#00ffc3] tracking-wide mb-6 text-center">
            Sign Up
          </h1>

          <TextInput
            label="Username:"
            icon={<MdPerson />}
            onChange={(e) => setUsername(e.target.value)}
            isInvalid={!validUsername}
          />

          <TextInput
            label="Display Name:"
            icon={<MdPerson />}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <TextInput
            label="Email:"
            type="email"
            icon={<MdEmail />}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidEmail(validateEmail());
            }}
            isInvalid={!validateEmail()}
          />

          <PasswordInput
            label="Password:"
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!validPassword}
          />
          {validPassword ? null : (
            <p className="text-xs text-red-400 mt-1 text-center">
              Password requirements not met
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center w-full mt-4 gap-4 max-w-sm mx-auto">
            <NeonButton type="submit" variant="outline">SIGN UP</NeonButton>
            <NeonButton onClick={signInWithGoogle} src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" variant="filled">
              SIGN UP WITH GOOGLE
            </NeonButton>
            </div>
          {bottomLink && <div className="mt-4 text-center">{bottomLink}</div>}
        </form>
      </div>
    </div>
  );
}
