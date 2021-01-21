import {
  publish,
  subscribe,
  debounceTime,
  distinctUntilChanged,
  duc,
  system,
  mapTo,
  merge,
  pipe,
  skip,
  streamFromEmitter,
  tup,
  statefulStream,
  stream,
  connect,
  combineLatest,
  map,
} from '@virtuoso.dev/urx'
import { domIOSystem } from './domIOSystem'

export interface ListBottomInfo {
  bottom: number
  offsetBottom: number
}

export const stateFlagsSystem = system(([{ scrollTop, viewportSize }]) => {
  const isAtBottom = statefulStream(false)
  const isAtTop = statefulStream(true)
  const atBottomStateChange = stream<boolean>()
  const atTopStateChange = stream<boolean>()
  const listStateListener = stream<ListBottomInfo>()

  // skip 1 to avoid an initial on/off flick
  const isScrolling = streamFromEmitter(
    pipe(
      merge(pipe(duc(scrollTop), skip(1), mapTo(true)), pipe(duc(scrollTop), skip(1), mapTo(false), debounceTime(100))),
      distinctUntilChanged()
    )
  )

  connect(
    pipe(
      duc(scrollTop),
      map(top => top === 0),
      distinctUntilChanged()
    ),
    isAtTop
  )

  connect(isAtTop, atTopStateChange)

  connect(
    pipe(
      combineLatest(listStateListener, duc(scrollTop), duc(viewportSize)),
      map(([{ bottom, offsetBottom }, scrollTop, viewportSize]) => {
        return offsetBottom === 0 && scrollTop + viewportSize - bottom > -4
      }),
      distinctUntilChanged()
    ),
    isAtBottom
  )

  subscribe(isAtBottom, value => {
    setTimeout(() => publish(atBottomStateChange, value))
  })

  // connect(isAtBottom, atBottomStateChange)

  return { isScrolling, isAtTop, isAtBottom, atTopStateChange, atBottomStateChange, listStateListener }
}, tup(domIOSystem))
