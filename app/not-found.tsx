import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dna, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Dna className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-7xl font-bold tracking-tight">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-md">
          A página que você está procurando não existe ou foi movida. Verifique o endereço ou volte ao início.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Ir para o Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/samples">Ver Amostras</Link>
        </Button>
      </div>
    </div>
  )
}
