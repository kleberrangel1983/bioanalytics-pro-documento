'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SAMPLE_TYPE_CONFIG } from '@/lib/constants'
import { MOCK_PATIENTS } from '@/lib/mock-data'
import type { SampleType } from '@/lib/types'
import { toast } from 'sonner'

const schema = z.object({
  type: z.enum(['blood', 'tissue', 'urine', 'saliva', 'csf', 'biopsy'] as [SampleType, ...SampleType[]]),
  patientId: z.string().min(1, 'Selecione um paciente'),
  collectedAt: z.string().min(1, 'Informe a data de coleta'),
  storageTemp: z.coerce.number(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SampleFormProps {
  onSuccess?: () => void
}

export function SampleForm({ onSuccess }: SampleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'blood',
      patientId: '',
      collectedAt: new Date().toISOString().slice(0, 16),
      storageTemp: -80,
      notes: '',
    },
  })

  function onSubmit(values: FormValues) {
    console.log('Nova amostra:', values)
    toast.success('Amostra cadastrada com sucesso!')
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Amostra</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.entries(SAMPLE_TYPE_CONFIG) as [SampleType, { label: string }][]).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_PATIENTS.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code} — {p.diagnosis}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="collectedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Coleta</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storageTemp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temperatura de Armazenamento (°C)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas opcionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit">Cadastrar Amostra</Button>
        </div>
      </form>
    </Form>
  )
}
