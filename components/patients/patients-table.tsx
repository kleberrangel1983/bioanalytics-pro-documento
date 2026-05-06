'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PatientSexBadge } from './patient-status-badge'
import { getSamplesByPatientId } from '@/lib/mock-data'
import type { Patient } from '@/lib/types'
import Link from 'next/link'

export function PatientsTable({ patients }: { patients: Patient[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Diagnóstico</TableHead>
            <TableHead>Amostras</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const samples = getSamplesByPatientId(patient.id)
            return (
              <TableRow key={patient.id}>
                <TableCell className="font-mono text-sm">{patient.code}</TableCell>
                <TableCell>{patient.age} anos</TableCell>
                <TableCell><PatientSexBadge sex={patient.sex} /></TableCell>
                <TableCell className="max-w-[200px] truncate">{patient.diagnosis}</TableCell>
                <TableCell>{samples.length}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/patients/${patient.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
