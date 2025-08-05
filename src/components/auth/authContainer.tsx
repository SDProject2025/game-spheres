import { useState, ReactNode } from "react";

import SignInForm from "./signIn/signInForm";

type Props = {
    signInWithGoogle: () => void;
    children: ReactNode;
}

export default function AuthContainer({signInWithGoogle, children}: Props) {
    return (
        <div>
            {children}
        </div>
    );
}