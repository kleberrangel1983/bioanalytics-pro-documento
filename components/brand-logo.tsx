import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  /** Exibe logo + nome (padrão) ou somente o logotipo */
  variant?: "full" | "icon"
  className?: string
  imageSize?: number
}

export function BrandLogo({ variant = "full", className, imageSize = 40 }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden"
        style={{ width: imageSize, height: imageSize }}
      >
        <Image
          src="/logo-bioanalytics.png"
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
            <span className="text-[oklch(0.682_0.097_176)]">Bio</span>
            <span className="text-[oklch(0.718_0.13_84)]">Analytics</span>
            {" "}
            <span className="inline-flex items-center justify-center rounded bg-[oklch(0.718_0.13_84)] text-[oklch(0.128_0.032_243)] text-[10px] font-black tracking-wider px-1.5 py-0.5 leading-none align-middle">
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
