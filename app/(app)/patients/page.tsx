import { PatientsTable } from '@/components/patients/patients-table'
import { MOCK_PATIENTS } from '@/lib/mock-data'
import { Users } from 'lucide-react'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">{MOCK_PATIENTS.length} pacientes cadastrados</p>
        </div>
      </div>
      <PatientsTable patients={MOCK_PATIENTS} />
    </div>
  )
}
