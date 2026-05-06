export type AppointmentStatus =
  | 'triagem'
  | 'agendado'
  | 'confirmado'
  | 'atendido'
  | 'cancelado'

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  triagem: ['agendado', 'cancelado'],
  agendado: ['confirmado', 'cancelado'],
  confirmado: ['atendido', 'cancelado'],
  atendido: [],
  cancelado: [],
}

export function canTransitionStatus(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}
