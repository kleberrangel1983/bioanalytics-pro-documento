import { canSend } from "@/lib/whatsapp-throttle"
import { writeAudit } from "@/lib/services/audit"

const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`
const WA_TOKEN   = process.env.WHATSAPP_TOKEN ?? ""
const isConfigured = Boolean(WA_TOKEN && process.env.WHATSAPP_PHONE_ID)

export type WaSendResult =
  | { status: "sent";      messageId: string }
  | { status: "simulated"; messageId: string }
  | { status: "throttled" }
  | { status: "error";     detail: unknown }

// ─── Send a free-text message ─────────────────────────────────────────────────
export async function sendTextMessage(
  to: string,
  body: string,
  callerEmail = "sistema",
): Promise<WaSendResult> {
  if (!canSend()) return { status: "throttled" }

  if (!isConfigured) {
    await writeAudit({
      userEmail: callerEmail,
      userRole: "secretaria",
      action: "ENVIAR_WHATSAPP",
      resource: `Para: ${to}`,
      ip: "sistema",
      severity: "info",
      details: `[simulado] ${body.slice(0, 100)}`,
    })
    return { status: "simulated", messageId: `sim_${Date.now()}` }
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  }

  try {
    const res = await fetch(WA_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      await writeAudit({
        userEmail: callerEmail,
        userRole: "secretaria",
        action: "ERRO_WHATSAPP",
        resource: `Para: ${to}`,
        ip: "sistema",
        severity: "warning",
        details: JSON.stringify(data).slice(0, 200),
        success: false,
      })
      return { status: "error", detail: data }
    }

    const messageId: string = data.messages?.[0]?.id ?? `wa_${Date.now()}`
    await writeAudit({
      userEmail: callerEmail,
      userRole: "secretaria",
      action: "ENVIAR_WHATSAPP",
      resource: `Para: ${to}`,
      ip: "sistema",
      severity: "info",
      details: body.slice(0, 100),
    })
    return { status: "sent", messageId }
  } catch (err) {
    return { status: "error", detail: String(err) }
  }
}

// ─── Send template message ────────────────────────────────────────────────────
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  language = "pt_BR",
  components: unknown[] = [],
  callerEmail = "sistema",
): Promise<WaSendResult> {
  if (!canSend()) return { status: "throttled" }

  if (!isConfigured) {
    await writeAudit({
      userEmail: callerEmail,
      userRole: "secretaria",
      action: "ENVIAR_WHATSAPP_TEMPLATE",
      resource: `Para: ${to}`,
      ip: "sistema",
      severity: "info",
      details: `[simulado] template=${templateName}`,
    })
    return { status: "simulated", messageId: `sim_${Date.now()}` }
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: { name: templateName, language: { code: language }, components },
  }

  try {
    const res = await fetch(WA_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return { status: "error", detail: data }

    const messageId: string = data.messages?.[0]?.id ?? `wa_${Date.now()}`
    return { status: "sent", messageId }
  } catch (err) {
    return { status: "error", detail: String(err) }
  }
}

// ─── Appointment confirmation helper ─────────────────────────────────────────
// Sends the standard "reply SIM to confirm / CANCELAR to cancel" message.
export async function sendAppointmentConfirmation(opts: {
  to: string
  patientName: string
  date: string   // e.g. "06/05/2026"
  time: string   // e.g. "09:30"
  type: string   // e.g. "Consulta inicial"
  callerEmail?: string
}): Promise<WaSendResult> {
  const body =
    `Olá, ${opts.patientName}! 👋\n\n` +
    `Confirmamos seu agendamento:\n` +
    `📅 Data: ${opts.date}\n` +
    `⏰ Hora: ${opts.time}\n` +
    `🏥 Tipo: ${opts.type}\n\n` +
    `Responda *SIM* para confirmar ou *CANCELAR* para cancelar.\n\n` +
    `BioAnalytics Pro 🧬`

  return sendTextMessage(opts.to, body, opts.callerEmail)
}
