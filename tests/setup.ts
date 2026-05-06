import "@testing-library/jest-dom"
import { vi } from "vitest"

// Stub next/headers used in server components/routes
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: "admin" })),
    set: vi.fn(),
  })),
}))

// Stub next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

// Default env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"
process.env.AUDIT_SECRET = "test-audit-secret"
process.env.WHATSAPP_APP_SECRET = "test-wa-secret"
process.env.WHATSAPP_VERIFY_TOKEN = "test-verify-token"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
