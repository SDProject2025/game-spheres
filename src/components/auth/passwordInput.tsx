'use client';
import { InputHTMLAttributes, useState } from "react";
import { MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

type Props = {
    label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({label, ...props}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative mb-4"> 
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder=" "
                className="peer w-full bg-transparent border-b-2 border-[#444] text-white text-sm pt-4 pb-1 px-7 outline-none
                           focus:border-[#00ffc3] focus:shadow-[0_0_8px_#00ffc3] placeholder-transparent"
            />
            <label
                className="absolute left-7 top-1.5 text-[#888] text-xs transition-all
                           peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#888]
                           peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#00ffc3]"
            >
                {label}
            </label>

            <MdLock className="absolute left-1.5 top-2.5 text-[#00ffc3] text-lg" />

            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-2.5 text-[#00ffc3] text-lg hover:text-white"
                tabIndex={-1}
            >
                {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
        </div>
    );
}
