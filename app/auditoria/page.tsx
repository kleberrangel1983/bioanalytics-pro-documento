import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AuditTable } from "./audit-table"
import type { AuditLog } from "./audit-table"

const AUTHORIZED_ROLES = ["admin"]

export default async function AuditoriaPage() {
  const cookieStore = await cookies()
  const role = cookieStore.get("bioanalytics-role")?.value

  if (!role || !AUTHORIZED_ROLES.includes(role)) {
    redirect("/acesso-negado?from=/auditoria")
  }

  // Fetch from the protected API route (server-to-server, same process)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/audit/logs`, {
    headers: {
      // Forward the role cookie so the API endpoint can authorize the request
      Cookie: `bioanalytics-role=${role}`,
    },
    // Never cache audit data
    cache: "no-store",
  })

  const logs: AuditLog[] = res.ok ? await res.json() : []

  return <AuditTable logs={logs} />
}
