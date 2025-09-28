'use client';
import { PasswordValidationStatus } from "firebase/auth";
import { InputHTMLAttributes, useState } from "react";
import { MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

type Props = {
    label: string;
    isInvalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({label, isInvalid, ...props}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative mb-4"> 
            <input
                {...props}
                id={id}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder=" "
                className={`peer w-full bg-transparent border-2 border-[#444] text-white
                           text-sm sm:text-base md:text-md pt-4 pb-1 px-7 pb-1 px-4 sm:px-6 md:px-8 
                           outline-none rounded-md placeholder-transparent
                           transition 
                           ${
                            isInvalid
                            ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_8px_#f87171] rounded-md"
                            : "border-[#444] focus:border-[#00ffc3] focus:shadow-[0_0_8px_#00ffc3] rounded-md"
                           }`}
            />
            <label 
                htmlFor={id}
                className="absolute left-8 top-2 text-[#888] text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#888] peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#00ffc3]"
            >
                {label}
            </label>
            <MdLock className="absolute left-2 top-3 text-[#00ffc3]" data-testid="lock-icon" />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-2.5 text-[#00ffc3] text-lg hover:text-white"
                tabIndex={-1}
            >
                {showPassword ? <MdVisibility data-testid="show-icon" /> : <MdVisibilityOff data-testid="hide-icon" />}
            </button>
        </div>
    );
}
