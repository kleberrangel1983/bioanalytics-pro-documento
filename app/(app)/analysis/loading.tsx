import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function AnalysisLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-36" /><Skeleton className="h-4 w-64 mt-2" /></div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-28" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-12" /><Skeleton className="h-3 w-20 mt-2" /></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="pt-6"><Skeleton className="h-[350px] w-full" /></CardContent></Card>
    </div>
  )
}
