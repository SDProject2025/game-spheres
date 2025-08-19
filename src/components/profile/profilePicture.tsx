import { ImgHTMLAttributes } from "react";
import type { StaticImageData } from "next/image";

type Props = {
  src: string | StaticImageData;
} & ImgHTMLAttributes<HTMLImageElement>;

export default function ProfilePicture({ src, ...props }: Props) {
  return (
    /* pfp - add rings around it possibly??? */

    <div className="relative flex items-center justify-center">
      <div className="absolute w-20 h-20 rounded-full">
        <div className="absolute inset-0 rounded-full border-4 border-[#00ffc3] shadow-[0_0_50px_#00ffc3,0_0_60px_#00ffc3,0_0_90px_#00ffc3]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent shadow-[0_0_30px_20px_#00ffc3] opacity-80"></div>
      </div>

      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[#222]">
        <img src={src} {...props} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
