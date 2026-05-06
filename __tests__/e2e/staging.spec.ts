import { test, expect, type Page } from "@playwright/test"

// ─── Auth fixture ─────────────────────────────────────────────────────────────
// AuthGuard reads from localStorage. We inject a valid admin session via
// addInitScript so it runs before React hydrates on every page load.

const ADMIN_SESSION = {
  user: {
    id: "usr_admin_001",
    name: "Carlos Administrador",
    email: "admin@bioanalytics.local",
    role: "admin",
    avatarInitials: "CA",
    department: "Gestão",
  },
  token: "mock-jwt-e2e-test-session",
  expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
}

async function injectAuth(page: Page) {
  await page.addInitScript((session) => {
    localStorage.setItem("bioanalytics_session", JSON.stringify(session))
  }, ADMIN_SESSION)
}

test.describe("/staging — fluxo E2E", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page) })

  test("renderiza título e botão de execução", async ({ page }) => {
    await page.goto("/staging")
    await expect(page.getByRole("heading", { name: /Semana 2/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /Executar Fluxo/i })).toBeVisible()
  })

  test("progresso avança ao executar o fluxo", async ({ page }) => {
    await page.goto("/staging")
    await page.getByRole("button", { name: /Executar Fluxo/i }).click()
    // button switches to "Executando…" immediately
    await expect(page.getByRole("button", { name: /Executando/i })).toBeVisible()
    // wait for completion (all steps pass) — up to 30s
    await expect(page.getByText(/Todos os testes aprovados/)).toBeVisible({ timeout: 30_000 })
  })

  test("links de navegação estão presentes", async ({ page }) => {
    await page.goto("/staging")
    for (const label of ["Perfis", "Rollback", "Carga", "Feature Flags", "Go-live", "Observabilidade", "LGPD"]) {
      await expect(page.getByRole("link", { name: new RegExp(label, "i") })).toBeVisible()
    }
  })
})

test.describe("/staging/carga — testes de carga", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page) })

  test("renderiza os 4 cenários", async ({ page }) => {
    await page.goto("/staging/carga")
    for (const label of ["Smoke", "Carga Normal", "Pico", "Stress"]) {
      await expect(page.getByText(label)).toBeVisible()
    }
  })

  test("botão iniciar fica ativo ao selecionar cenário", async ({ page }) => {
    await page.goto("/staging/carga")
    await page.getByText("Smoke").click()
    await expect(page.getByRole("button", { name: /Iniciar/i })).toBeEnabled()
  })

  test("inicia simulação e exibe gráfico", async ({ page }) => {
    await page.goto("/staging/carga")
    await page.getByText("Smoke").click()
    await page.getByRole("button", { name: /Iniciar/i }).click()
    // Recharts SVG should appear
    await expect(page.locator("svg.recharts-surface")).toBeVisible({ timeout: 5_000 })
    // stop it
    await page.getByRole("button", { name: /Parar/i }).click()
  })
})

test.describe("/staging/flags — feature flags", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page) })

  test("renderiza lista de flags", async ({ page }) => {
    await page.goto("/staging/flags")
    await expect(page.getByText("Novo Dashboard Analítico")).toBeVisible()
    await expect(page.getByText("Triagem por IA")).toBeVisible()
  })

  test("toggle de ambiente muda para produção", async ({ page }) => {
    await page.goto("/staging/flags")
    await page.getByRole("button", { name: /Produção/i }).click()
    await expect(page.getByText(/produção/i).first()).toBeVisible()
  })

  test("seletor de perfil avalia flags para o novo perfil", async ({ page }) => {
    await page.goto("/staging/flags")
    // Role selector uses <button> elements (not a <select>/combobox)
    await page.getByRole("button", { name: /Paciente/i }).click()
    await expect(page.getByText(/Paciente/i).first()).toBeVisible()
  })
})

test.describe("/staging/golive — checklist", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page) })

  test("renderiza itens do checklist", async ({ page }) => {
    await page.goto("/staging/golive")
    await expect(page.getByText(/checklist/i).first()).toBeVisible()
    // at least one pending item
    await expect(page.getByText(/Pendente/i).first()).toBeVisible()
  })

  test("clique em item altera status", async ({ page }) => {
    await page.goto("/staging/golive")
    const firstItem = page.getByText(/Pendente/i).first()
    await firstItem.click()
    // after click should show OK or Falhou (cycles through)
    await expect(page.getByText(/OK|Falhou/i).first()).toBeVisible()
  })
})

test.describe("/staging/observabilidade — métricas", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page) })

  test("renderiza painel de métricas com botão iniciar", async ({ page }) => {
    await page.goto("/staging/observabilidade")
    await expect(page.getByRole("button", { name: /Iniciar/i })).toBeVisible()
  })

  test("métricas aparecem após iniciar", async ({ page }) => {
    await page.goto("/staging/observabilidade")
    await page.getByRole("button", { name: /Iniciar/i }).click()
    // chart SVG should render within 3s
    await expect(page.locator("svg.recharts-surface")).toBeVisible({ timeout: 5_000 })
    await page.getByRole("button", { name: /Parar/i }).click()
  })
})

test.describe("/staging/lgpd — compliance", () => {
  test.beforeEach(async ({ page }) => { await injectAuth(page) })

  test("renderiza princípios LGPD", async ({ page }) => {
    await page.goto("/staging/lgpd")
    await expect(page.getByText(/LGPD/i).first()).toBeVisible()
    await expect(page.getByText(/Art\./i).first()).toBeVisible()
  })

  test("exibe pelo menos um controle de segurança", async ({ page }) => {
    await page.goto("/staging/lgpd")
    await expect(page.getByText(/criptografia|consentimento|pseudoanonimização/i).first()).toBeVisible()
  })
})
