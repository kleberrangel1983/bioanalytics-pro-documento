import { Badge } from '@/components/ui/badge'
import type { Patient } from '@/lib/types'

export function PatientSexBadge({ sex }: { sex: Patient['sex'] }) {
  return (
    <Badge variant={sex === 'M' ? 'default' : 'secondary'}>
      {sex === 'M' ? 'Masculino' : 'Feminino'}
    </Badge>
  )
}
