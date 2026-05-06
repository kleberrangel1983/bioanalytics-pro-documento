import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("")
  })

  it("returns a single class unchanged", () => {
    expect(cn("px-4")).toBe("px-4")
  })

  it("joins multiple class strings", () => {
    expect(cn("flex", "items-center", "gap-2")).toBe("flex items-center gap-2")
  })

  it("drops falsy values (false, null, undefined, 0, empty string)", () => {
    expect(cn("block", false, null, undefined, 0, "")).toBe("block")
  })

  it("includes truthy conditional classes", () => {
    const active = true
    expect(cn("btn", active && "btn-active")).toBe("btn btn-active")
  })

  it("excludes falsy conditional classes", () => {
    const active = false
    expect(cn("btn", active && "btn-active")).toBe("btn")
  })

  it("resolves Tailwind conflicts — last class wins (twMerge)", () => {
    // twMerge keeps only the last of conflicting utilities
    expect(cn("p-2", "p-4")).toBe("p-4")
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500")
  })

  it("does not merge non-conflicting utilities", () => {
    const result = cn("flex", "p-4", "text-sm")
    expect(result).toContain("flex")
    expect(result).toContain("p-4")
    expect(result).toContain("text-sm")
  })

  it("handles object syntax from clsx", () => {
    expect(cn({ hidden: true, block: false })).toBe("hidden")
    expect(cn({ hidden: false, block: true })).toBe("block")
  })

  it("handles array syntax from clsx", () => {
    expect(cn(["flex", "gap-2"])).toBe("flex gap-2")
  })

  it("handles mixed string, object and array inputs", () => {
    const result = cn("base", ["arr-class"], { cond: true }, false && "nope")
    expect(result).toContain("base")
    expect(result).toContain("arr-class")
    expect(result).toContain("cond")
    expect(result).not.toContain("nope")
  })
})
