import { ImgHTMLAttributes } from "react";
import type { StaticImageData } from "next/image";

type Props = {
    src: string | StaticImageData;
} & ImgHTMLAttributes<HTMLImageElement>;

export default function ProfilePicture({src, ...props}: Props){
    return (
        /* pfp - add rings around it possibly??? */
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[#222]">
            <img
                src={src}
                {...props}
                className="w-full h-full object-cover"
            />
        </div>
    );
}