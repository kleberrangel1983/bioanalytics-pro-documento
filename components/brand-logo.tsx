import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  variant?: "full" | "icon"
  className?: string
  imageSize?: number
}

export function BrandLogo({ variant = "full", className, imageSize = 40 }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: imageSize, height: imageSize }}
      >
        <Image
          src="/logo-bioanalytics.webp"
          alt="BioAnalytics Pro"
          width={imageSize}
          height={imageSize}
          className="object-cover"
          priority
        />
      </div>

      {variant === "full" && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight">
            <span className="text-brand-teal">Bio</span>
            <span className="text-brand-gold">Analytics</span>
            {" "}
            <span className="inline-flex items-center justify-center rounded bg-brand-gold text-brand-navy text-[10px] font-black tracking-wider px-1.5 py-0.5 leading-none align-middle">
              PRO
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
            Monitoramento Clínico
          </span>
        </div>
      )}
    </div>
  )
}
