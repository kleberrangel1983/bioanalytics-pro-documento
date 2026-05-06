import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { reducer } from "@/hooks/use-toast"

type State = Parameters<typeof reducer>[0]
type Action = Parameters<typeof reducer>[1]

function makeToast(
  id: string,
  overrides: Record<string, unknown> = {},
): State["toasts"][number] {
  return { id, open: true, ...overrides } as unknown as State["toasts"][number]
}

// DISMISS_TOAST has a setTimeout side-effect (addToRemoveQueue).
// Fake timers prevent real timers from accumulating across tests.
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("reducer / ADD_TOAST", () => {
  it("adds a toast to an empty state", () => {
    const next = reducer(
      { toasts: [] },
      { type: "ADD_TOAST", toast: makeToast("a") } as Action,
    )
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe("a")
  })

  it("prepends the new toast so it appears first", () => {
    const next = reducer(
      { toasts: [makeToast("old")] },
      { type: "ADD_TOAST", toast: makeToast("new") } as Action,
    )
    expect(next.toasts[0].id).toBe("new")
  })

  it("enforces TOAST_LIMIT=1 by dropping the older toast", () => {
    const next = reducer(
      { toasts: [makeToast("old")] },
      { type: "ADD_TOAST", toast: makeToast("new") } as Action,
    )
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts.find((t) => t.id === "old")).toBeUndefined()
  })
})

describe("reducer / UPDATE_TOAST", () => {
  it("merges the provided fields onto the matching toast", () => {
    const next = reducer(
      { toasts: [makeToast("a", { title: "original" })] },
      { type: "UPDATE_TOAST", toast: { id: "a", title: "updated" } } as Action,
    )
    expect(next.toasts[0].title).toBe("updated")
  })

  it("preserves existing fields not present in the update payload", () => {
    const next = reducer(
      { toasts: [makeToast("a", { title: "keep", description: "me" })] },
      { type: "UPDATE_TOAST", toast: { id: "a", title: "changed" } } as Action,
    )
    expect(next.toasts[0].description).toBe("me")
  })

  it("leaves non-matching toasts untouched", () => {
    const s: State = { toasts: [makeToast("a"), makeToast("b", { title: "B" })] }
    const next = reducer(s, {
      type: "UPDATE_TOAST",
      toast: { id: "a", title: "A-updated" },
    } as Action)
    expect(next.toasts.find((t) => t.id === "b")?.title).toBe("B")
  })
})

describe("reducer / DISMISS_TOAST", () => {
  it("sets open:false on the specified toast", () => {
    const next = reducer(
      { toasts: [makeToast("a", { open: true })] },
      { type: "DISMISS_TOAST", toastId: "a" } as Action,
    )
    expect(next.toasts[0].open).toBe(false)
  })

  it("leaves other toasts open when toastId is specified", () => {
    const s: State = { toasts: [makeToast("a"), makeToast("b")] }
    const next = reducer(s, { type: "DISMISS_TOAST", toastId: "a" } as Action)
    expect(next.toasts.find((t) => t.id === "b")?.open).toBe(true)
  })

  it("sets open:false on ALL toasts when toastId is undefined", () => {
    const s: State = { toasts: [makeToast("a"), makeToast("b"), makeToast("c")] }
    const next = reducer(s, { type: "DISMISS_TOAST" } as Action)
    expect(next.toasts.every((t) => t.open === false)).toBe(true)
  })
})

describe("reducer / REMOVE_TOAST", () => {
  it("removes the toast with the matching id", () => {
    const next = reducer(
      { toasts: [makeToast("a")] },
      { type: "REMOVE_TOAST", toastId: "a" } as Action,
    )
    expect(next.toasts).toHaveLength(0)
  })

  it("leaves non-matching toasts in place", () => {
    const s: State = { toasts: [makeToast("a"), makeToast("b")] }
    const next = reducer(s, { type: "REMOVE_TOAST", toastId: "a" } as Action)
    expect(next.toasts).toHaveLength(1)
    expect(next.toasts[0].id).toBe("b")
  })

  it("clears all toasts when toastId is undefined", () => {
    const s: State = { toasts: [makeToast("a"), makeToast("b"), makeToast("c")] }
    const next = reducer(s, { type: "REMOVE_TOAST" } as Action)
    expect(next.toasts).toHaveLength(0)
  })
})
