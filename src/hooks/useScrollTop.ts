import { useRef, useCallback, useEffect } from 'react'

export type CallbackRefParam = HTMLElement | null

export default function useScrollTop(
  scrollTopCallback: (scrollTop: number) => void,
  smoothScrollTargetReached: (yes: true) => void,
  scrollerElement: any,
  scrollHorizontally: boolean
) {
  const scrollerRef = useRef<any>(null)
  const scrollTopTarget = useRef<any>(null)
  const timeoutRef = useRef<any>(null)

  const handler = useCallback(
    (ev: Event) => {
      const el = ev.target as HTMLElement
      const scrollTop = scrollHorizontally ? el.scrollLeft : el.scrollTop
      scrollTopCallback(Math.max(scrollTop, 0))

      if (scrollTopTarget.current !== null) {
        if (
          scrollTop === scrollTopTarget.current ||
          scrollTop <= 0 ||
          (scrollHorizontally ? scrollTop === el.scrollWidth - el.offsetWidth : scrollTop === el.scrollHeight - el.offsetHeight)
        ) {
          scrollTopTarget.current = null
          smoothScrollTargetReached(true)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
        }
      }
    },
    [scrollHorizontally, scrollTopCallback, smoothScrollTargetReached]
  )

  useEffect(() => {
    const localRef = scrollerRef.current!
    handler({ target: localRef } as Event)
    localRef.addEventListener('scroll', handler, { passive: true })

    return () => {
      localRef.removeEventListener('scroll', handler)
    }
  }, [scrollerRef, handler, scrollerElement])

  function scrollToCallback(location: ScrollToOptions) {
    const scrollerElement = scrollerRef.current
    if (!scrollerElement) {
      return
    }

    const isSmooth = location.behavior === 'smooth'

    // avoid system hanging because the DOM never called back
    // with the scrollTop
    // scroller is already at this location
    if (scrollerElement.offsetHeight === scrollerElement.scrollHeight || location.top === scrollerElement.scrollTop) {
      scrollTopCallback(scrollerElement.scrollTop)
      if (isSmooth) {
        smoothScrollTargetReached(true)
      }
      return
    }

    const maxScrollTop = scrollerElement.scrollHeight - scrollerElement.offsetHeight
    location.top = Math.max(Math.min(maxScrollTop, location.top!), 0)

    if (isSmooth) {
      scrollTopTarget.current = location.top
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        scrollTopTarget.current = null
        smoothScrollTargetReached(true)
      }, 1000)
    } else {
      scrollTopTarget.current = null
    }

    scrollerElement.scrollTo(location)
  }

  function scrollByCallback(location: ScrollToOptions) {
    if (scrollTopTarget.current === null) {
      scrollerRef.current.scrollBy(location)
    }
  }

  return { scrollerRef, scrollByCallback, scrollToCallback }
}
