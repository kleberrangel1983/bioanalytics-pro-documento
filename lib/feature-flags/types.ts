import type { UserRole } from "@/lib/staging/types"

export type Environment = "staging" | "production"

export type FlagCategory =
  | "ui"
  | "api"
  | "experimental"
  | "rollout"

export interface RolloutRule {
  type: "percentage"
  value: number // 0–100
}

export interface RoleRule {
  type: "roles"
  allowedRoles: UserRole[]
}

export type TargetingRule = RolloutRule | RoleRule

export interface FeatureFlag {
  id: string
  name: string
  description: string
  category: FlagCategory
  environments: Record<Environment, FlagState>
  targeting: TargetingRule[]
  owner: string
  createdAt: string
  tags: string[]
}

export interface FlagState {
  enabled: boolean
  rolloutPct: number    // 0–100 (global %)
  roleOverrides: Partial<Record<UserRole, boolean>>
}

export interface FlagEvaluationResult {
  flagId: string
  userId: string
  role: UserRole
  environment: Environment
  enabled: boolean
  reason: "flag_disabled" | "role_override_on" | "role_override_off" | "rollout_in" | "rollout_out"
  rolloutPct: number
}

export interface RolloutEvent {
  flagId: string
  environment: Environment
  timestamp: string
  action: "enable" | "disable" | "rollout_change" | "role_override"
  from: Partial<FlagState>
  to: Partial<FlagState>
  author: string
}
