import { createHmac, timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { findPendingAppointmentByPhone, updateAppointmentStatus } from "@/lib/services/appointments"
import { writeAudit } from "@/lib/services/audit"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? ""
const APP_SECRET   = process.env.WHATSAPP_APP_SECRET   ?? ""
const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

// ─── GET — Meta webhook verification handshake ────────────────────────────────
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode      = searchParams.get("hub.mode")
  const token     = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// ─── POST — incoming messages ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }

  const rawBody = await request.text()

  const expected  = "sha256=" + createHmac("sha256", APP_SECRET).update(rawBody).digest("hex")
  const sigBuffer = Buffer.from(signature)
  const expBuffer = Buffer.from(expected)

  if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown"

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value.messages ?? []) {
        await handleInboundMessage(message, ip)
      }
    }
  }

  // WhatsApp requires 200 within 20 s or it will retry
  return NextResponse.json({ status: "ok" })
}

async function handleInboundMessage(message: InboundMessage, ip: string) {
  const from = message.from  // phone number in E.164 format
  const body = (message.text?.body ?? "").trim().toUpperCase()

  if (!isConfigured) {
    console.log(`[WA] ${from}: ${body} (mock mode — Supabase not configured)`)
    return
  }

  const appointment = await findPendingAppointmentByPhone(from)

  if (body === "SIM" && appointment) {
    await updateAppointmentStatus(appointment.id, "confirmado")
    await writeAudit({
      userEmail: from,
      userRole: "convidado",
      action: "CONFIRMAR_AGENDAMENTO",
      resource: `Agendamento ${appointment.id} via WhatsApp`,
      ip,
      severity: "info",
      details: `Paciente ${appointment.patients.name} confirmou via WhatsApp`,
    })
    return
  }

  if (body === "CANCELAR" && appointment) {
    await updateAppointmentStatus(appointment.id, "cancelado", "Cancelado pelo paciente via WhatsApp")
    await writeAudit({
      userEmail: from,
      userRole: "convidado",
      action: "CANCELAR_AGENDAMENTO",
      resource: `Agendamento ${appointment.id} via WhatsApp`,
      ip,
      severity: "warning",
      details: `Paciente ${appointment.patients.name} cancelou via WhatsApp`,
    })
    return
  }

  // Free-text → log only (route to agent queue in future)
  await writeAudit({
    userEmail: from,
    userRole: "convidado",
    action: "MENSAGEM_LIVRE_WHATSAPP",
    resource: `De: ${from}`,
    ip,
    severity: "info",
    details: message.text?.body?.slice(0, 200),
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface WhatsAppWebhookPayload {
  entry?: { changes?: { value: { messages?: InboundMessage[] } }[] }[]
}

interface InboundMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: { body: string }
}
