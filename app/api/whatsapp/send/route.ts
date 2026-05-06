import { NextRequest, NextResponse } from "next/server"
import { canSend, currentTokens } from "@/lib/whatsapp-throttle"

const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`
const WA_TOKEN = process.env.WHATSAPP_TOKEN ?? ""

export async function POST(request: NextRequest) {
  if (!canSend()) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded — retry after 1 s",
        tokens: currentTokens(),
      },
      { status: 429, headers: { "Retry-After": "1" } },
    )
  }

  let body: SendRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { to, type, text, template } = body

  if (!to) {
    return NextResponse.json({ error: "Missing 'to' field" }, { status: 422 })
  }

  // In HML (no real token) return a simulated success response
  if (!WA_TOKEN || WA_TOKEN === "") {
    return NextResponse.json({
      status: "simulated",
      messageId: `sim_${Date.now()}`,
      to,
      tokens: currentTokens(),
    })
  }

  // Production: forward to WhatsApp Business API
  const waPayload =
    type === "template" && template
      ? {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: template.name,
            language: { code: template.language ?? "pt_BR" },
            components: template.components ?? [],
          },
        }
      : {
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text ?? "" },
        }

  const waResponse = await fetch(WA_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(waPayload),
  })

  const waData = await waResponse.json()

  if (!waResponse.ok) {
    return NextResponse.json(
      { error: "WhatsApp API error", detail: waData },
      { status: waResponse.status },
    )
  }

  return NextResponse.json({
    status: "sent",
    messageId: waData.messages?.[0]?.id,
    to,
    tokens: currentTokens(),
  })
}

// ---- Types ----

interface SendRequest {
  to: string
  type?: "text" | "template"
  text?: string
  template?: {
    name: string
    language?: string
    components?: unknown[]
  }
}
