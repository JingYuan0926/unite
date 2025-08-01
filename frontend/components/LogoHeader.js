import Image from "next/image";
import { LineShadowText } from "@/components/magicui/line-shadow-text";

export default function LogoHeader() {
  return (
    <div className="flex items-center">
      <Image
        src="/1inch_color_black.svg"
        alt="1inch logo"
        width={300}
        height={140}
        priority
      />
      <div className="relative">
        <LineShadowText 
          as="h1" 
          className="text-6xl font-bold text-gray-900 italic whitespace-nowrap"
        >
          Agent Kit
        </LineShadowText>
      </div>
    </div>
  );
} 