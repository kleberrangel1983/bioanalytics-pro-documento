import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminPanel from "./admin-panel"

const AUTHORIZED_ROLES = ["admin"]

export default async function AdminPage() {
  const cookieStore = await cookies()
  const role = cookieStore.get("bioanalytics-role")?.value

  if (!role || !AUTHORIZED_ROLES.includes(role)) {
    redirect("/acesso-negado?from=/admin")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const headers = { Cookie: `bioanalytics-role=${role}`, "Cache-Control": "no-store" }

  const [usersRes, flagsRes] = await Promise.all([
    fetch(`${baseUrl}/api/admin/users`, { headers, cache: "no-store" }),
    fetch(`${baseUrl}/api/admin/flags`, { headers, cache: "no-store" }),
  ])

  const users = usersRes.ok ? await usersRes.json() : []
  const flags = flagsRes.ok ? await flagsRes.json() : []

  return <AdminPanel initialUsers={users} initialFlags={flags} />
}
