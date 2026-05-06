import { describe, it, expect } from "vitest"
import { CHECKLIST, computeBlockers, isApproved } from "@/lib/staging/golive-data"
import type { CheckItem } from "@/lib/staging/golive-types"

describe("CHECKLIST", () => {
  it("has items", () => {
    expect(CHECKLIST.length).toBeGreaterThan(0)
  })

  it("all items start as pending", () => {
    CHECKLIST.forEach((item) => {
      expect(item.status).toBe("pending")
    })
  })

  it("has at least one critical item", () => {
    expect(CHECKLIST.some((c) => c.critical)).toBe(true)
  })
})

describe("computeBlockers", () => {
  it("returns empty array when no critical items are failed", () => {
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: "ok" as const,
    }))
    expect(computeBlockers(items)).toHaveLength(0)
  })

  it("returns labels of critical items with status fail", () => {
    const criticalItem = CHECKLIST.find((c) => c.critical)!
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: c.id === criticalItem.id ? ("fail" as const) : ("ok" as const),
    }))
    const blockers = computeBlockers(items)
    expect(blockers).toContain(criticalItem.label)
  })

  it("does not include non-critical failed items", () => {
    const nonCritical = CHECKLIST.filter((c) => !c.critical)
    if (nonCritical.length === 0) return
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: !c.critical ? ("fail" as const) : ("ok" as const),
    }))
    expect(computeBlockers(items)).toHaveLength(0)
  })
})

describe("isApproved", () => {
  it("returns false when critical items are pending", () => {
    expect(isApproved(CHECKLIST)).toBe(false)
  })

  it("returns true when all critical items are ok", () => {
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: "ok" as const,
    }))
    expect(isApproved(items)).toBe(true)
  })

  it("returns true when critical items are na (not applicable)", () => {
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: "na" as const,
    }))
    expect(isApproved(items)).toBe(true)
  })

  it("returns false when any critical item is fail", () => {
    const criticalItem = CHECKLIST.find((c) => c.critical)!
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: c.id === criticalItem.id ? ("fail" as const) : ("ok" as const),
    }))
    expect(isApproved(items)).toBe(false)
  })
})
