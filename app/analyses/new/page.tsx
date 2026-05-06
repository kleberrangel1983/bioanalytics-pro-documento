'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// ─── Schema ───────────────────────────────────────────────────────────────────

const analysisSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(120, 'Nome não pode exceder 120 caracteres'),
  tipo: z.enum(
    ['Genômica', 'Proteômica', 'Metabolômica', 'Transcriptômica', 'Epigenômica'],
    { required_error: 'Selecione um tipo de análise' },
  ),
  prioridade: z.enum(['baixa', 'normal', 'alta', 'urgente']).default('normal'),
  descricao: z.string().max(500, 'Descrição não pode exceder 500 caracteres').optional(),
  amostras: z
    .string()
    .min(1, 'Informe pelo menos uma amostra')
    .refine(
      (v) => v.split('\n').filter(Boolean).length <= 50,
      'Máximo de 50 amostras por análise',
    ),
  parametros: z.string().optional(),
})

type AnalysisFormValues = z.infer<typeof analysisSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAnalysisPage() {
  const router = useRouter()

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      nome: '',
      prioridade: 'normal',
      descricao: '',
      amostras: '',
      parametros: '',
    },
  })

  function onSubmit(data: AnalysisFormValues) {
    // In a real app, submit to API here
    console.log('Nova análise:', data)
    router.push('/analyses')
  }

  return (
    <AppShell title="Nova análise">
      <div className="flex items-center gap-3 -mt-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/analyses">
            <ArrowLeft className="size-4" />
            Voltar para análises
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações básicas</CardTitle>
              <CardDescription>Identifique e classifique a análise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da análise</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sequenciamento genômico paciente 42" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome descritivo que identifique o objetivo da análise.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de análise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Genômica">Genômica</SelectItem>
                          <SelectItem value="Proteômica">Proteômica</SelectItem>
                          <SelectItem value="Metabolômica">Metabolômica</SelectItem>
                          <SelectItem value="Transcriptômica">Transcriptômica</SelectItem>
                          <SelectItem value="Epigenômica">Epigenômica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o objetivo e contexto clínico desta análise…"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Máximo de 500 caracteres.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Amostras */}
          <Card>
            <CardHeader>
              <CardTitle>Amostras</CardTitle>
              <CardDescription>Informe os identificadores das amostras a serem analisadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="amostras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IDs das amostras</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={'SAMPLE-001\nSAMPLE-002\nSAMPLE-003'}
                        className="font-mono text-sm resize-none"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Um ID por linha. Máximo de 50 amostras por análise.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Parâmetros avançados */}
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros avançados</CardTitle>
              <CardDescription>Configurações opcionais para o pipeline de análise</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="parametros"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parâmetros customizados <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={'quality_threshold: 30\nmin_depth: 10\nreference_genome: hg38'}
                        className="font-mono text-sm resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Parâmetros em formato YAML para substituir as configurações padrão do pipeline.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/analyses">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enviando…' : 'Iniciar análise'}
            </Button>
          </div>
        </form>
      </Form>
    </AppShell>
  )
}
