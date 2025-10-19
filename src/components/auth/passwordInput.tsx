'use client';
import { InputHTMLAttributes, useState } from "react";
import { MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

type Props = {
    label: string;
    isInvalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({ label, isInvalid, ...props }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    // Tailwind classes for consistent icon spacing (adjust these for closer/further)
    const iconLeftPaddingClass = "pl-9";
    const iconRightPaddingClass = "pr-9";
    const labelLeftPositionClass = "left-9"; // Matches left padding for input text alignment

    return (
        <div className="relative mb-4">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder=" "
                className={`peer w-full bg-transparent border-2 border-[#444] text-white
                           text-sm sm:text-base md:text-md pt-4 pb-1 
                            ${iconLeftPaddingClass} ${iconRightPaddingClass} 
                           outline-none rounded-md placeholder-transparent
                           transition 
                           ${isInvalid
                        ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_8px_#f87171] rounded-md"
                        : "border-[#444] focus:border-[#00ffc3] focus:shadow-[0_0_8px_#00ffc3] rounded-md"
                    }`}
            />
            <label
                className={`absolute ${labelLeftPositionClass} top-1.5 text-xs transition-all 
                            ${isInvalid
                        ? "text-red-400 peer-focus:text-red-500"
                        : "text-[#888] peer-focus:text-[#00ffc3]"
                    }
                           peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#888]
                           peer-focus:top-1.5 peer-focus:text-xs`}
            >
                {label}
            </label>

            {/* ⬅️ Added conditional color for the lock icon */}
            <MdLock
                className={`absolute left-1.5 top-2.5 text-xl sm:text-2xl 
                    ${isInvalid ? "text-red-400" : "text-[#00ffc3]"}`}
            />

            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute right-2 top-2.5 hover:text-white transition text-xl sm:text-2xl
                    ${isInvalid ? "text-red-400" : "text-[#00ffc3]"}`}
                tabIndex={-1}
            >
                {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
        </div>
    );
}