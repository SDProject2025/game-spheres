import { Share } from "lucide-react";

type Props = {
    onClick: () => void;
}
export default function ShareButton({onClick}: Props) {
    return <button onClick={onClick}>
        <Share className="cursor-pointer text-[#00ffd5]"/>
    </button>
}