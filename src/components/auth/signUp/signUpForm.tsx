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
};

export default function SignUpForm({
  handleSignUpClick,
  validateUsername,
  validatePassword,
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
    if (validateEmail() && (await validateUsername(username)) && (await validatePassword(password))) {
      handleSignUpClick(username, displayName, email, password);
    } else {
      
    }
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
        {validUsername ? null : <p>Username already taken</p>}

        <TextInput
          label="Display Name:"
          icon={<MdPerson />}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <TextInput
          label="Email:"
          icon={<MdEmail />}
          onChange={(e) => {
            setEmail(e.target.value);
            setValidEmail(validateEmail());
          }}
        />
        {validEmail ? null : <p>Invalid email address</p>}

        <PasswordInput
          label="Password:"
          onChange={(e) => setPassword(e.target.value)}
        />
        {validPassword ? null : <p>Password does not meet requirements</p>}

        <div className="flex justify-center w-full mt-4">
          <NeonButton type="submit">SIGN UP</NeonButton>
        </div>
      </form>
    </div>
  );
}
