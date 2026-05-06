import { describe, it, expect } from "vitest"
import { CHECKLIST, CATEGORY_META, computeBlockers, isApproved } from "@/lib/staging/golive-data"
import type { CheckItem, CheckCategory } from "@/lib/staging/golive-types"

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

  it("has at least one item in each of the 6 expected categories", () => {
    const expected: CheckCategory[] = [
      "staging", "carga", "flags", "seguranca", "infra", "comunicacao",
    ]
    for (const cat of expected) {
      expect(
        CHECKLIST.some((c) => c.category === cat),
        `category "${cat}" has no items`
      ).toBe(true)
    }
  })

  it("CATEGORY_META covers exactly the same 6 categories as CHECKLIST items", () => {
    const categoriesInChecklist = new Set(CHECKLIST.map((c) => c.category))
    const categoriesInMeta = new Set(Object.keys(CATEGORY_META) as CheckCategory[])
    expect(categoriesInChecklist).toEqual(categoriesInMeta)
  })

  it("every item has a non-empty id, label, and category", () => {
    for (const item of CHECKLIST) {
      expect(item.id.length).toBeGreaterThan(0)
      expect(item.label.length).toBeGreaterThan(0)
      expect(item.category.length).toBeGreaterThan(0)
    }
  })

  it("all item ids are unique", () => {
    const ids = CHECKLIST.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
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

  it("returns all labels when every critical item fails simultaneously", () => {
    const criticalItems = CHECKLIST.filter((c) => c.critical)
    expect(criticalItems.length).toBeGreaterThanOrEqual(2)

    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: c.critical ? ("fail" as const) : ("ok" as const),
    }))
    const blockers = computeBlockers(items)

    expect(blockers).toHaveLength(criticalItems.length)
    for (const ci of criticalItems) {
      expect(blockers).toContain(ci.label)
    }
  })

  it("does not include pending items (pending ≠ fail, no label returned)", () => {
    // pending is the natural initial state — it should NOT appear as a blocker
    // (blockers are only critical + fail)
    const items: CheckItem[] = CHECKLIST.map((c) => ({ ...c, status: "pending" as const }))
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

  it("returns false when any single critical item is pending (pending blocks approval)", () => {
    // pending is not in the approved set {ok, na}
    const criticalItem = CHECKLIST.find((c) => c.critical)!
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      // set everything to ok, except the one critical item left as pending
      status: c.id === criticalItem.id ? ("pending" as const) : ("ok" as const),
    }))
    expect(isApproved(items)).toBe(false)
  })

  it("returns true when non-critical items are fail but all critical are ok", () => {
    // failing non-critical items must NOT block approval
    const items: CheckItem[] = CHECKLIST.map((c) => ({
      ...c,
      status: c.critical ? ("ok" as const) : ("fail" as const),
    }))
    expect(isApproved(items)).toBe(true)
  })

  it("returns true when critical items mix ok and na", () => {
    // mixing the two approved statuses should still pass
    let toggle = false
    const items: CheckItem[] = CHECKLIST.map((c) => {
      if (!c.critical) return { ...c, status: "fail" as const }
      toggle = !toggle
      return { ...c, status: toggle ? ("ok" as const) : ("na" as const) }
    })
    expect(isApproved(items)).toBe(true)
  })
})
