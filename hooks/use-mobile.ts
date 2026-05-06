import * as React from 'react'

import { MOBILE_BREAKPOINT, isMobileWidth } from '@/lib/mobile'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(isMobileWidth(window.innerWidth))
    }
    mql.addEventListener('change', onChange)
    setIsMobile(isMobileWidth(window.innerWidth))
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
