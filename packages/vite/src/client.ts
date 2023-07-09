import { cache, use, useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import { createFromFetch, encodeReply } from 'react-server-dom-webpack/client'

export function serve<Props>(rscId: string, basePath = '/RSC/') {
  type SetRerender = (
    rerender: (next: [ReactElement, string]) => void
  ) => () => void
  const fetchRSC = cache(
    (serializedProps: string): readonly [React.ReactElement, SetRerender] => {
      console.log('fetchRSC serializedProps', serializedProps)

      let rerender: ((next: [ReactElement, string]) => void) | undefined
      const setRerender: SetRerender = (fn) => {
        rerender = fn
        return () => {
          rerender = undefined
        }
      }

      const searchParams = new URLSearchParams()
      searchParams.set('props', serializedProps)

      const options = {
        async callServer(rsfId: string, args: unknown[]) {
          const isMutating = !!mutationMode
          const searchParams = new URLSearchParams()
          searchParams.set('action_id', rsfId)
          let id: string
          if (isMutating) {
            id = rscId
            searchParams.set('props', serializedProps)
          } else {
            id = '_'
          }
          const response = fetch(basePath + id + '/' + searchParams, {
            method: 'POST',
            body: await encodeReply(args),
          })
          const data = createFromFetch(response, options)
          if (isMutating) {
            rerender?.([data, serializedProps])
          }
          return data
        },
      }

      const prefetched = (globalThis as any).__WAKU_PREFETCHED__?.[rscId]?.[
        serializedProps
      ]

      console.log(
        'fetchRSC before createFromFetch',
        basePath + rscId + '/' + searchParams
      )
      const data = createFromFetch(
        prefetched || fetch(basePath + rscId + '/' + searchParams),
        options
      )
      console.log('fetchRSC after createFromFetch. data:', data)
      return [data, setRerender]
    }
  )

  // Create temporary client component that wraps the ServerComponent returned
  // by the `createFromFetch` call.
  const ServerComponent = (props: Props) => {
    console.log('ServerComponent props', props)

    // FIXME we blindly expect JSON.stringify usage is deterministic
    const serializedProps = JSON.stringify(props || {})
    const [data, setRerender] = fetchRSC(serializedProps)
    const [state, setState] = useState<
      [dataToOverride: ReactElement, lastSerializedProps: string] | undefined
    >()

    // MARK Should this be useLayoutEffect?
    useEffect(() => setRerender(setState), [setRerender])

    let dataToReturn = data

    if (state) {
      if (state[1] === serializedProps) {
        dataToReturn = state[0]
      } else {
        setState(undefined)
      }
    }

    // FIXME The type error
    // "Cannot read properties of null (reading 'alternate')"
    // is caused with startTransition.
    // Not sure if it's a React bug or our misusage.
    // For now, using `use` seems to fix it. Is it a correct fix?
    return use(dataToReturn as any) as typeof dataToReturn
  }

  return ServerComponent
}

let mutationMode = 0

export function mutate(fn: () => void) {
  ++mutationMode
  fn()
  --mutationMode
}

// test change
