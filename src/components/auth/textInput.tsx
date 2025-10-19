'use client';
import { InputHTMLAttributes, JSX } from "react";

type Props = {
    icon?: JSX.Element;
    label: string;
    isInvalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({ label, icon, isInvalid, ...props }: Props) {
    // Conditional base classes for padding and positioning
    const iconBasePaddingClass = icon ? "pl-6 sm:pl-8 md:pl-9" : "pl-4 sm:pl-6 md:pl-8";
    const iconBaseLabelLeftClass = icon ? "left-6 sm:left-8 md:left-9" : "left-4 sm:left-6 md:left-8";
    const iconFocusLabelLeftClass = icon ? "left-6 sm:left-8 md:left-9" : "left-7"; // Keep original focused label left-7 for non-icon case, but align with padding for icon case.

    return (
        <div className="relative mb-4">
            <input
                {...props}
                required
                placeholder=" "
                className={`peer w-full bg-transparent border-2 border-[#444] text-white
                 text-sm sm:text-base md:text-md pt-4 pb-1
                 outline-none rounded-md placeholder-transparent
                 transition
                    ${iconBasePaddingClass}
                 ${isInvalid
                        ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_8px_#f87171] rounded-md"
                        : "border-[#444] focus:border-[#00ffc3] focus:shadow-[0_0_8px_#00ffc3] rounded-md"
                    }`}
            />
            <label
                className={`absolute top-1.5 text-[#888] transition-all
                 text-xs
                    ${iconFocusLabelLeftClass}
                 ${isInvalid
                        ? "text-red-400 peer-focus:text-red-500"
                        : "text-[#888] peer-focus:text-[#00ffc3]"
                    }
                 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#888]
                    ${iconBaseLabelLeftClass}
                 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#00ffc3]`}
            >
                {label}
            </label>
            {icon && (
                <div className={`absolute left-1.5 top-2.5 text-lg sm:text-xl md:text-2xl
                     ${isInvalid ? "text-red-400" : "text-[#00ffc3]"}`}>
                    {icon}
                </div>
            )}
        </div>
    );
}