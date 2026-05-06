import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-brand-gold animate-spin" />
        <p className="text-sm text-muted-foreground font-medium tracking-wide">
          Carregando…
        </p>
      </div>
    </div>
  )
}
