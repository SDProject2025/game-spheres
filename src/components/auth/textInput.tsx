'use client';
import { InputHTMLAttributes, JSX } from "react";

type Props = {
    icon?: JSX.Element;
    label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({label, icon, ...props}: Props) {
    return (
        <label className='flex flex-col relative mt-2'>
            <span>{label}</span>
            <div className='flex relative'>
                {icon && 
                    <div className="absolute left-1 top-3 text-green-500">
                        {icon}
                    </div>
                }
                <input className="p-2 pl-6 border-b-2 border-gray-200 focus:outline-none focus:border-green-500 focus:shadow-md focus:shadow-green-500 transition-all duration-200"
                    {...props}
                />
            </div>
        </label>
    );
}