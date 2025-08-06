'use client';
import { InputHTMLAttributes, useState } from "react";
import { MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

type Props = {
    label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({label, ...props}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <label className='flex flex-col relative mt-2'>
            <span>{label}</span>
            <div className='flex relative'>
                <MdLock className='absolute left-1 top-3 text-green-500'/>
                <input
                    {...props}
                    type={showPassword ? 'text' : 'password'}
                    className="p-2 pl-6 border-b-2 border-gray-200 focus:outline-none focus:border-green-500 focus:shadow-md focus:shadow-green-500 transition-all duration-200"
                />
                <button type="button"
                    onClick={(e) => setShowPassword(prev => !prev)}
                    className='absolute right-23 top-3'
                >
                    {showPassword ? <MdVisibility/> : <MdVisibilityOff/>}
                </button>
            </div>
        </label>
    );
}