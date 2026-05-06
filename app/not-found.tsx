import Link from "next/link"
import Image from "next/image"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center space-y-8">
      {/* logo */}
      <div className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-brand-gold/30 opacity-80">
        <Image
          src="/logo-bioanalytics.webp"
          alt="BioAnalytics Pro"
          fill
          className="object-cover"
        />
      </div>

      {/* 404 */}
      <div className="space-y-3">
        <p className="text-8xl font-black text-brand-gold/20 tracking-tighter select-none">
          404
        </p>
        <h1 className="text-xl font-bold text-foreground -mt-4">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          A rota que você tentou acessar não existe neste ambiente.
        </p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href="javascript:history.back()">
            <ArrowLeft size={15} />
            Voltar
          </Link>
        </Button>
        <Button asChild className="gap-2">
          <Link href="/">
            <Home size={15} />
            Início
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/50 font-mono">
        BioAnalytics Pro · Homologação
      </p>
    </main>
  )
}
