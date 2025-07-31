import Image from "next/image";

interface LogoProps {
  className?: string;
  useImage?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}

export function Logo({ 
  className = "h-8 w-8", 
  useImage = true, 
  imageSrc = "/logo.png",
  imageAlt = "BOGOFIT Logo"
}: LogoProps) {
  if (useImage) {
    return (
      <div className={`rounded-lg p-2 ${className}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={32}
          height={32}
          className="h-full w-full object-contain border-2 border-gray-300 rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className={`bg-fuchsia-500 rounded-lg p-2 ${className}`}>
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-white font-bold text-sm">BF</span>
      </div>
    </div>
  );
} 