'use client';
import { InputHTMLAttributes, JSX } from "react";

type Props = {
    icon?: JSX.Element;
    label: string;
    isInvalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({label, icon, isInvalid, ...props}: Props) {
    return (
        <div className="relative mb-4">
            <input
                {...props}
                required
                placeholder=" "
                className={`peer w-full bg-transparent border-b-2 text-white
                 text-sm sm:text-base md:text-lg pt-4 pb-1 px-4 sm:px-6 md:px-8
                 outline-none placeholder-transparent
                 transition
                 ${
                 isInvalid
                   ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_8px_#f87171]" // red glow
                   : "border-[#444] focus:border-[#00ffc3] focus:shadow-[0_0_8px_#00ffc3]" // normal glow
                 }`}
            />
            <label
                className="absolute left-7 top-1.5 text-[#888] text-xs transition-all
                           peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#888]
                           peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#00ffc3]"
            >
                {label}
            </label>
            {icon && (
                <div className="absolute left-1.5 top-2.5 text-[#00ffc3] text-lg" >
                    {icon}
                </div>
            )}
        </div>
    );
}
