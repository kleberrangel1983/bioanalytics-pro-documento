import { createHmac, timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? ""
const APP_SECRET = process.env.WHATSAPP_APP_SECRET ?? ""

// GET — Meta webhook verification handshake
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// POST — incoming messages from Meta
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }

  const rawBody = await request.text()

  // Validate HMAC-SHA256 using timing-safe comparison
  const expected = "sha256=" + createHmac("sha256", APP_SECRET).update(rawBody).digest("hex")
  const sigBuffer = Buffer.from(signature)
  const expBuffer = Buffer.from(expected)

  if (
    sigBuffer.length !== expBuffer.length ||
    !timingSafeEqual(sigBuffer, expBuffer)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Process each entry/change
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      for (const message of value.messages ?? []) {
        await handleInboundMessage(message, value.metadata)
      }
    }
  }

  // WhatsApp requires a 200 within 20 s to avoid retries
  return NextResponse.json({ status: "ok" })
}

async function handleInboundMessage(
  message: InboundMessage,
  metadata: WebhookMetadata,
) {
  const body = message.text?.body?.trim().toUpperCase() ?? ""

  if (body === "SIM") {
    // TODO: confirm appointment linked to this phone number
    console.log(`[WA] Confirmação recebida de ${message.from}`)
  } else if (body === "CANCELAR") {
    // TODO: cancel appointment and notify secretary
    console.log(`[WA] Cancelamento recebido de ${message.from}`)
  } else {
    // TODO: route to human agent queue
    console.log(`[WA] Mensagem livre de ${message.from}: ${message.text?.body}`)
  }

  // TODO: persist to audit log
  void metadata
}

// ---- Types ----

interface WhatsAppWebhookPayload {
  entry?: WebhookEntry[]
}

interface WebhookEntry {
  changes?: WebhookChange[]
}

interface WebhookChange {
  value: WebhookValue
}

interface WebhookValue {
  metadata: WebhookMetadata
  messages?: InboundMessage[]
}

interface WebhookMetadata {
  phone_number_id: string
  display_phone_number: string
}

interface InboundMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: { body: string }
}
