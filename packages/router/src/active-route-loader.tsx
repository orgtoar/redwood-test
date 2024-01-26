import React, { Suspense, useEffect, useRef } from 'react'

import { getAnnouncement, getFocus, resetFocus } from './a11yUtils'
import { usePageLoadingContext } from './PageLoadingContext'
import type { Spec } from './util'
import { inIframe } from './util'

interface Props {
  path: string
  spec: Spec
  params?: Record<string, string>
  whileLoadingPage?: () => React.ReactNode | null
  children?: React.ReactNode
}

let isPrerendered = false

if (typeof window !== 'undefined') {
  const redwoodAppElement = document.getElementById('redwood-app')

  if (redwoodAppElement && redwoodAppElement.children.length > 0) {
    isPrerendered = true
  }
}

let firstLoad = true

const Fallback = ({ children }: { children: React.ReactNode }) => {
  const { loading, setPageLoadingContext, delay } = usePageLoadingContext()

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoadingContext(true)
    }, delay)
    return () => {
      clearTimeout(timer)
      setPageLoadingContext(false)
    }
  }, [delay, setPageLoadingContext])

  return <>{loading ? children : null}</>
}

export const ActiveRouteLoader = ({
  spec,
  params,
  whileLoadingPage,
}: Props) => {
  const announcementRef = useRef<HTMLDivElement>(null)

  const usePrerenderLoader =
    globalThis.__REDWOOD__PRERENDERING || (isPrerendered && firstLoad)

  const LazyRouteComponent = usePrerenderLoader
    ? spec.prerenderLoader(spec.name).default
    : spec.LazyComponent

  // After first load set to false to switch to client side fetching
  if (firstLoad) {
    firstLoad = false
  }

  useEffect(() => {
    // Make this hook a no-op if we're rendering in an iframe.
    if (inIframe()) {
      return
    }

    if (announcementRef.current) {
      announcementRef.current.innerText = getAnnouncement()
    }

    const routeFocus = getFocus()
    if (!routeFocus) {
      resetFocus()
    } else {
      routeFocus.focus()
    }
  }, [spec, params])

  // Delete params ref & key so that they are not spread on to the component
  if (params) {
    delete params['ref']
    delete params['key']
  }

  return (
    <Suspense fallback={<Fallback>{whileLoadingPage?.()}</Fallback>}>
      <LazyRouteComponent {...params} />
      <div
        id="redwood-announcer"
        style={{
          position: 'absolute',
          top: 0,
          width: 1,
          height: 1,
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={announcementRef}
      ></div>
    </Suspense>
  )
}
