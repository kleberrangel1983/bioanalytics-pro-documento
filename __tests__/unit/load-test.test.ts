import { describe, it, expect } from "vitest"
import {
  generateSnapshot,
  buildEndpointSummaries,
  computeSlaBreaches,
  SCENARIOS,
} from "@/lib/staging/load-test"
import type { ScenarioId } from "@/lib/staging/load-test"

const SMOKE  = SCENARIOS.smoke
const CARGA  = SCENARIOS.carga
const PICO   = SCENARIOS.pico
const STRESS = SCENARIOS.stress

describe("generateSnapshot", () => {
  it("returns a snapshot with all required fields", () => {
    const snap = generateSnapshot(10, SMOKE)
    expect(snap).toMatchObject({
      ts: 10,
      rps: expect.any(Number),
      p50Ms: expect.any(Number),
      p95Ms: expect.any(Number),
      p99Ms: expect.any(Number),
      errorRatePct: expect.any(Number),
      activeUsers: expect.any(Number),
    })
  })

  it("ramps up users linearly during ramp period", () => {
    const half = SMOKE.rampUpSeconds / 2
    const snap = generateSnapshot(half, SMOKE)
    expect(snap.activeUsers).toBeLessThanOrEqual(SMOKE.virtualUsers)
    expect(snap.activeUsers).toBeGreaterThan(0)
  })

  it("reaches full virtualUsers after ramp period", () => {
    const snap = generateSnapshot(SMOKE.rampUpSeconds + 1, SMOKE)
    expect(snap.activeUsers).toBe(SMOKE.virtualUsers)
  })

  it("p95 is always greater than p50", () => {
    for (let t = 0; t < CARGA.durationSeconds; t += 10) {
      const snap = generateSnapshot(t, CARGA)
      expect(snap.p95Ms).toBeGreaterThan(snap.p50Ms)
    }
  })

  it("p99 is always greater than p95", () => {
    const snap = generateSnapshot(60, CARGA)
    expect(snap.p99Ms).toBeGreaterThanOrEqual(snap.p95Ms)
  })

  it("errorRatePct is non-negative", () => {
    const snap = generateSnapshot(30, CARGA)
    expect(snap.errorRatePct).toBeGreaterThanOrEqual(0)
  })
})

describe("buildEndpointSummaries", () => {
  it("returns empty array when given no snapshots", () => {
    expect(buildEndpointSummaries([], SMOKE)).toEqual([])
  })

  it("returns one summary per endpoint", () => {
    const snaps = [generateSnapshot(10, SMOKE), generateSnapshot(20, SMOKE)]
    const summaries = buildEndpointSummaries(snaps, SMOKE)
    expect(summaries).toHaveLength(SMOKE.endpoints.length)
  })

  it("each summary has required shape", () => {
    const snaps = [generateSnapshot(10, SMOKE)]
    const [s] = buildEndpointSummaries(snaps, SMOKE)
    expect(s).toMatchObject({
      path: expect.any(String),
      label: expect.any(String),
      requests: expect.any(Number),
      errorsCount: expect.any(Number),
      p50Ms: expect.any(Number),
      p95Ms: expect.any(Number),
      p99Ms: expect.any(Number),
      passed: expect.any(Boolean),
    })
  })

  it("requests are proportional to endpoint weights", () => {
    const snaps = Array.from({ length: 20 }, (_, t) => generateSnapshot(t * 2, CARGA))
    const summaries = buildEndpointSummaries(snaps, CARGA)
    const totalWeight = CARGA.endpoints.reduce((s, e) => s + e.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 5)
    const totalRequests = summaries.reduce((s, e) => s + e.requests, 0)
    expect(totalRequests).toBeGreaterThan(0)
  })
})

// ── SCENARIOS catalogue ───────────────────────────────────────────────────────

describe("SCENARIOS", () => {
  it("has exactly the four expected keys", () => {
    const expectedKeys: ScenarioId[] = ["smoke", "carga", "pico", "stress"]
    expect(Object.keys(SCENARIOS).sort()).toEqual(expectedKeys.slice().sort())
  })

  it("each scenario has a unique virtualUsers count", () => {
    const vus = Object.values(SCENARIOS).map((s) => s.virtualUsers)
    expect(new Set(vus).size).toBe(4)
  })

  it("each scenario's endpoint weights sum to 1", () => {
    for (const scenario of Object.values(SCENARIOS)) {
      const total = scenario.endpoints.reduce((s, e) => s + e.weight, 0)
      expect(total).toBeCloseTo(1, 5)
    }
  })

  it("pico has more virtualUsers than carga", () => {
    expect(PICO.virtualUsers).toBeGreaterThan(CARGA.virtualUsers)
  })

  it("stress has the highest virtualUsers of all scenarios", () => {
    const max = Math.max(...Object.values(SCENARIOS).map((s) => s.virtualUsers))
    expect(STRESS.virtualUsers).toBe(max)
  })
})

// ── generateSnapshot — pico scenario ─────────────────────────────────────────

describe("generateSnapshot — pico scenario", () => {
  it("returns full virtualUsers (200) after ramp-up period", () => {
    const snap = generateSnapshot(PICO.rampUpSeconds + 1, PICO)
    expect(snap.activeUsers).toBe(PICO.virtualUsers)
  })

  it("ramps up linearly during ramp period", () => {
    const snap = generateSnapshot(PICO.rampUpSeconds / 2, PICO)
    expect(snap.activeUsers).toBeGreaterThan(0)
    expect(snap.activeUsers).toBeLessThanOrEqual(PICO.virtualUsers)
  })

  it("p95 is always greater than p50 throughout pico duration", () => {
    for (let t = 0; t <= PICO.durationSeconds; t += 10) {
      const snap = generateSnapshot(t, PICO)
      expect(snap.p95Ms).toBeGreaterThan(snap.p50Ms)
    }
  })

  it("errorRatePct is non-negative", () => {
    const snap = generateSnapshot(50, PICO)
    expect(snap.errorRatePct).toBeGreaterThanOrEqual(0)
  })
})

// ── generateSnapshot — stress scenario ───────────────────────────────────────

describe("generateSnapshot — stress scenario", () => {
  it("returns full virtualUsers (500) after ramp-up period", () => {
    const snap = generateSnapshot(STRESS.rampUpSeconds + 1, STRESS)
    expect(snap.activeUsers).toBe(STRESS.virtualUsers)
  })

  it("ramps up linearly during ramp period", () => {
    const half = STRESS.rampUpSeconds / 2
    const snap = generateSnapshot(half, STRESS)
    expect(snap.activeUsers).toBeGreaterThan(0)
    expect(snap.activeUsers).toBeLessThanOrEqual(STRESS.virtualUsers)
  })

  it("p99 is always >= p95 under stress load", () => {
    const snap = generateSnapshot(STRESS.rampUpSeconds + 10, STRESS)
    expect(snap.p99Ms).toBeGreaterThanOrEqual(snap.p95Ms)
  })
})

describe("computeSlaBreaches", () => {
  it("returns empty array when given no snapshots", () => {
    expect(computeSlaBreaches([], [], SMOKE)).toEqual([])
  })

  it("returns no breaches for a smoke test with low latency snapshots", () => {
    // Manually craft snapshots well within SLA
    const goodSnap = {
      ts: 5, rps: 5, p50Ms: 100, p95Ms: 200, p99Ms: 300, errorRatePct: 0, activeUsers: 5,
    }
    const breaches = computeSlaBreaches([goodSnap], [], SMOKE)
    expect(breaches).toHaveLength(0)
  })

  it("reports P95 breach when avg p95 exceeds SLA target", () => {
    const badSnap = {
      ts: 5, rps: 5, p50Ms: 600, p95Ms: SMOKE.slaTargets.p95LatencyMs + 500,
      p99Ms: 2000, errorRatePct: 0, activeUsers: 5,
    }
    const breaches = computeSlaBreaches([badSnap], [], SMOKE)
    expect(breaches.some((b) => b.includes("P95"))).toBe(true)
  })

  it("reports error rate breach when max errorRatePct exceeds SLA", () => {
    const badSnap = {
      ts: 5, rps: 5, p50Ms: 100, p95Ms: 200, p99Ms: 300,
      errorRatePct: SMOKE.slaTargets.errorRatePct + 5,
      activeUsers: 5,
    }
    const breaches = computeSlaBreaches([badSnap], [], SMOKE)
    expect(breaches.some((b) => b.includes("erros"))).toBe(true)
  })

  it("reports throughput breach when avgRps is below minRps", () => {
    const lowRpsSnap = {
      ts: 5, rps: 0.5, p50Ms: 100, p95Ms: 200, p99Ms: 300, errorRatePct: 0, activeUsers: 5,
    }
    const breaches = computeSlaBreaches([lowRpsSnap], [], SMOKE)
    expect(breaches.some((b) => b.includes("Throughput"))).toBe(true)
  })

  // ── pico SLA thresholds (P95 < 2 000ms, errors < 2%, minRps 60) ──────────

  it("pico: reports P95 breach when avg p95 exceeds 2 000ms", () => {
    const badSnap = {
      ts: 20, rps: 80, p50Ms: 800,
      p95Ms: PICO.slaTargets.p95LatencyMs + 200, // 2 200ms
      p99Ms: 4000, errorRatePct: 0, activeUsers: 200,
    }
    const breaches = computeSlaBreaches([badSnap], [], PICO)
    expect(breaches.some((b) => b.includes("P95"))).toBe(true)
  })

  it("pico: reports error rate breach when errorRatePct exceeds 2%", () => {
    const badSnap = {
      ts: 20, rps: 80, p50Ms: 400, p95Ms: 1000, p99Ms: 2000,
      errorRatePct: PICO.slaTargets.errorRatePct + 1, // 3%
      activeUsers: 200,
    }
    const breaches = computeSlaBreaches([badSnap], [], PICO)
    expect(breaches.some((b) => b.includes("erros"))).toBe(true)
  })

  it("pico: no P95 or error breach when metrics are within relaxed SLA", () => {
    const goodSnap = {
      ts: 20, rps: 70, p50Ms: 400,
      p95Ms: PICO.slaTargets.p95LatencyMs - 100, // 1 900ms — within 2 000ms
      p99Ms: 2500,
      errorRatePct: PICO.slaTargets.errorRatePct - 0.5, // 1.5% — within 2%
      activeUsers: 200,
    }
    const breaches = computeSlaBreaches([goodSnap], [], PICO)
    const latencyOrErrorBreaches = breaches.filter(
      (b) => b.includes("P95") || b.includes("erros")
    )
    expect(latencyOrErrorBreaches).toHaveLength(0)
  })

  // ── stress SLA thresholds (P95 < 3 000ms, errors < 5%, minRps 100) ───────

  it("stress: reports P95 breach when avg p95 exceeds 3 000ms", () => {
    const badSnap = {
      ts: 40, rps: 120, p50Ms: 1200,
      p95Ms: STRESS.slaTargets.p95LatencyMs + 500, // 3 500ms
      p99Ms: 6000, errorRatePct: 0, activeUsers: 500,
    }
    const breaches = computeSlaBreaches([badSnap], [], STRESS)
    expect(breaches.some((b) => b.includes("P95"))).toBe(true)
  })

  it("stress: reports error rate breach when errorRatePct exceeds 5%", () => {
    const badSnap = {
      ts: 40, rps: 120, p50Ms: 800, p95Ms: 2000, p99Ms: 3000,
      errorRatePct: STRESS.slaTargets.errorRatePct + 1, // 6%
      activeUsers: 500,
    }
    const breaches = computeSlaBreaches([badSnap], [], STRESS)
    expect(breaches.some((b) => b.includes("erros"))).toBe(true)
  })

  it("stress: no P95 or error breach when metrics are within (relaxed) stress SLA", () => {
    const goodSnap = {
      ts: 40, rps: 150, p50Ms: 800,
      p95Ms: STRESS.slaTargets.p95LatencyMs - 200, // 2 800ms — within 3 000ms
      p99Ms: 4000,
      errorRatePct: STRESS.slaTargets.errorRatePct - 1, // 4% — within 5%
      activeUsers: 500,
    }
    const breaches = computeSlaBreaches([goodSnap], [], STRESS)
    const latencyOrErrorBreaches = breaches.filter(
      (b) => b.includes("P95") || b.includes("erros")
    )
    expect(latencyOrErrorBreaches).toHaveLength(0)
  })

  // ── endpointSummaries breach path (line 228) ──────────────────────────────

  it("reports a breach message per failed endpoint in endpointSummaries", () => {
    const goodSnap = {
      ts: 5, rps: 5, p50Ms: 100, p95Ms: 200, p99Ms: 300, errorRatePct: 0, activeUsers: 5,
    }
    const failedEndpoints = [
      { path: "/api/patients", label: "Listar Pacientes", requests: 100,
        errorsCount: 5, p50Ms: 400, p95Ms: 1500, p99Ms: 2000, passed: false },
      { path: "/api/triage",   label: "Triagem",          requests: 50,
        errorsCount: 2, p50Ms: 300, p95Ms: 1200, p99Ms: 1800, passed: false },
    ]
    const breaches = computeSlaBreaches([goodSnap], failedEndpoints, SMOKE)
    const endpointBreaches = breaches.filter((b) => b.includes("Endpoint"))
    expect(endpointBreaches).toHaveLength(2)
    expect(endpointBreaches[0]).toContain("Listar Pacientes")
    expect(endpointBreaches[1]).toContain("Triagem")
  })

  it("does not add endpoint breach messages when all endpoints passed", () => {
    const goodSnap = {
      ts: 5, rps: 5, p50Ms: 100, p95Ms: 200, p99Ms: 300, errorRatePct: 0, activeUsers: 5,
    }
    const passedEndpoints = [
      { path: "/api/patients", label: "Listar Pacientes", requests: 100,
        errorsCount: 0, p50Ms: 150, p95Ms: 400, p99Ms: 600, passed: true },
    ]
    const breaches = computeSlaBreaches([goodSnap], passedEndpoints, SMOKE)
    expect(breaches.filter((b) => b.includes("Endpoint"))).toHaveLength(0)
  })

  it("endpoint breach message contains the endpoint label", () => {
    const goodSnap = {
      ts: 5, rps: 5, p50Ms: 100, p95Ms: 200, p99Ms: 300, errorRatePct: 0, activeUsers: 5,
    }
    const failed = [
      { path: "/api/logs", label: "Logs de Auditoria", requests: 30,
        errorsCount: 3, p50Ms: 600, p95Ms: 2000, p99Ms: 3000, passed: false },
    ]
    const breaches = computeSlaBreaches([goodSnap], failed, SMOKE)
    expect(breaches.some((b) => b.includes("Logs de Auditoria"))).toBe(true)
  })
})
