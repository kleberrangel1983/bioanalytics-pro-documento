import { describe, it, expect } from "vitest"
import {
  generateSnapshot,
  buildEndpointSummaries,
  computeSlaBreaches,
  SCENARIOS,
} from "@/lib/staging/load-test"

const SMOKE = SCENARIOS.smoke
const CARGA = SCENARIOS.carga

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
})
