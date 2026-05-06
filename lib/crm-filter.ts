export type CrmStatus = 'novo' | 'triagem' | 'agendado' | 'reativacao'

export type CrmLead = {
  id: string
  clinicId: string
  name: string
  status: CrmStatus
  source: 'whatsapp' | 'instagram' | 'indicacao' | 'site'
  createdAtIso: string
}

export type CrmFilterInput = {
  clinicId: string
  statuses?: CrmStatus[]
  sources?: CrmLead['source'][]
  dateFromIso?: string
  dateToIso?: string
}

export function filterCrmLeads(leads: CrmLead[], filter: CrmFilterInput): CrmLead[] {
  return leads.filter((lead) => {
    if (lead.clinicId !== filter.clinicId) return false

    if (filter.statuses && filter.statuses.length > 0 && !filter.statuses.includes(lead.status)) {
      return false
    }

    if (filter.sources && filter.sources.length > 0 && !filter.sources.includes(lead.source)) {
      return false
    }

    const leadTs = new Date(lead.createdAtIso).getTime()
    if (filter.dateFromIso && leadTs < new Date(filter.dateFromIso).getTime()) return false
    if (filter.dateToIso && leadTs > new Date(filter.dateToIso).getTime()) return false

    return true
  })
}
