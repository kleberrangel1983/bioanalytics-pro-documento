export type UserRole =
  | 'admin'
  | 'medico'
  | 'secretaria'
  | 'financeiro'
  | 'paciente'
  | 'suporte'

export type PolicyAction =
  | 'edit_clinical_conduct'
  | 'view_own_patient_data'
  | 'view_any_patient_data'

const POLICY_MATRIX: Record<UserRole, Record<PolicyAction, boolean>> = {
  admin: {
    edit_clinical_conduct: false,
    view_own_patient_data: false,
    view_any_patient_data: true,
  },
  medico: {
    edit_clinical_conduct: true,
    view_own_patient_data: false,
    view_any_patient_data: true,
  },
  secretaria: {
    edit_clinical_conduct: false,
    view_own_patient_data: false,
    view_any_patient_data: false,
  },
  financeiro: {
    edit_clinical_conduct: false,
    view_own_patient_data: false,
    view_any_patient_data: false,
  },
  paciente: {
    edit_clinical_conduct: false,
    view_own_patient_data: true,
    view_any_patient_data: false,
  },
  suporte: {
    edit_clinical_conduct: false,
    view_own_patient_data: false,
    view_any_patient_data: false,
  },
}

export function canRole(role: UserRole, action: PolicyAction): boolean {
  return POLICY_MATRIX[role][action]
}
