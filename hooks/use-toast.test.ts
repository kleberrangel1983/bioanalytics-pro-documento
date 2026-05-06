import { describe, it, expect } from "vitest"
import { reducer } from "./use-toast"

const makeToast = (id: string) => ({
  id,
  open: true,
  title: `Toast ${id}`,
})

describe("reducer", () => {
  describe("ADD_TOAST", () => {
    it("adiciona um toast ao estado vazio", () => {
      const state = { toasts: [] }
      const next = reducer(state, { type: "ADD_TOAST", toast: makeToast("1") })
      expect(next.toasts).toHaveLength(1)
      expect(next.toasts[0].id).toBe("1")
    })

    it("respeita TOAST_LIMIT=1 — mantém somente o mais recente", () => {
      const state = { toasts: [makeToast("1")] }
      const next = reducer(state, { type: "ADD_TOAST", toast: makeToast("2") })
      expect(next.toasts).toHaveLength(1)
      expect(next.toasts[0].id).toBe("2")
    })

    it("insere o novo toast no início da lista", () => {
      const state = { toasts: [] }
      const next = reducer(state, { type: "ADD_TOAST", toast: makeToast("a") })
      expect(next.toasts[0].id).toBe("a")
    })
  })

  describe("UPDATE_TOAST", () => {
    it("atualiza somente o toast com o id correspondente", () => {
      const state = {
        toasts: [makeToast("1"), makeToast("2")],
      }
      const next = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Atualizado" },
      })
      expect(next.toasts.find((t) => t.id === "1")?.title).toBe("Atualizado")
      expect(next.toasts.find((t) => t.id === "2")?.title).toBe("Toast 2")
    })

    it("não altera a lista quando o id não existe", () => {
      const state = { toasts: [makeToast("1")] }
      const next = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "99", title: "Fantasma" },
      })
      expect(next.toasts[0].title).toBe("Toast 1")
    })
  })

  describe("DISMISS_TOAST", () => {
    it("define open=false somente no toast com o id informado", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] }
      const next = reducer(state, { type: "DISMISS_TOAST", toastId: "1" })
      expect(next.toasts.find((t) => t.id === "1")?.open).toBe(false)
      expect(next.toasts.find((t) => t.id === "2")?.open).toBe(true)
    })

    it("define open=false em todos os toasts quando toastId é undefined", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] }
      const next = reducer(state, { type: "DISMISS_TOAST", toastId: undefined })
      expect(next.toasts.every((t) => t.open === false)).toBe(true)
    })
  })

  describe("REMOVE_TOAST", () => {
    it("remove somente o toast com o id informado", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] }
      const next = reducer(state, { type: "REMOVE_TOAST", toastId: "1" })
      expect(next.toasts).toHaveLength(1)
      expect(next.toasts[0].id).toBe("2")
    })

    it("limpa toda a lista quando toastId é undefined", () => {
      const state = { toasts: [makeToast("1"), makeToast("2")] }
      const next = reducer(state, { type: "REMOVE_TOAST", toastId: undefined })
      expect(next.toasts).toHaveLength(0)
    })

    it("não altera o estado quando o id não existe", () => {
      const state = { toasts: [makeToast("1")] }
      const next = reducer(state, { type: "REMOVE_TOAST", toastId: "99" })
      expect(next.toasts).toHaveLength(1)
    })
  })
})
