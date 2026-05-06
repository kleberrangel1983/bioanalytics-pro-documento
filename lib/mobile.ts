export const MOBILE_BREAKPOINT = 768

export function isMobileWidth(width: number): boolean {
  return width < MOBILE_BREAKPOINT
}
