'use client'
import { withProvider } from "@/config/authorisation";
import { googleProvider, auth } from "@/config/firebaseConfig";

export default function SignIn() {

    async function handleSignUp() {
        await withProvider(googleProvider);
    }

    return (
        <div>
            <button type="button" className='flex flex-row justify-evenly items-center rounded-2xl bg-gray-300 shadow-md text-gray-700 w-[50%] h-10 hover:bg-gray-500 hover:text-white transition-colors duration-200'>
                <span className="font-medium">Sign in with Google</span>
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google icon"
                    className="h-5 w-5"
                />
            </button>
        </div>
    );
}