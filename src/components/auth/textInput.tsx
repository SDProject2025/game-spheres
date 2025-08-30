'use client';
import { InputHTMLAttributes, JSX } from "react";

type Props = {
    icon?: JSX.Element;
    label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({label, icon, id, ...props}: Props) {
    return (
        <div className="relative mb-6">
            <input
                {...props}
                id={id}
                required
                placeholder=" "
                className="peer w-full bg-transparent border-b-2 border-[#444] text-white pt-5 pb-2 px-8 outline-none focus:border-[#00ffc3] focus:shadow-[0_0_10px_#00ffc3] placeholder-transparent"
            />
            <label
                htmlFor={id}
                className="absolute left-8 top-2 text-[#888] text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#888] peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#00ffc3]"
            >
                {label}
            </label>
            {icon && (
                <div className="absolute left-2 top-3 text-[#00ffc3]" data-testid="icon">
                    {icon}
                </div>
            )}
        </div>
    );
}
