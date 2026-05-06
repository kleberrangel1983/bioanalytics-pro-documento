import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn()", () => {
  it("retorna uma string vazia quando não recebe argumentos", () => {
    expect(cn()).toBe("")
  })

  it("retorna a classe quando recebe um único argumento", () => {
    expect(cn("px-4")).toBe("px-4")
  })

  it("concatena múltiplas classes", () => {
    expect(cn("px-4", "py-2", "rounded")).toBe("px-4 py-2 rounded")
  })

  it("filtra valores falsy (undefined, null, false)", () => {
    expect(cn("px-4", undefined, null, false, "py-2")).toBe("px-4 py-2")
  })

  it("aplica classes condicionais via objeto", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold")
  })

  it("mescla classes Tailwind conflitantes, mantendo a última", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("combina classes estáticas com condicionais", () => {
    const isActive = true
    expect(cn("base-class", { active: isActive, inactive: !isActive })).toBe(
      "base-class active"
    )
  })

  it("mescla corretamente classes de padding com shorthand e longhand", () => {
    expect(cn("p-4", "px-2")).toBe("p-4 px-2")
  })
})
