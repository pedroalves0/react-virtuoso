import * as u from '@virtuoso.dev/urx'
import { domIOSystem, DOWN, ScrollDirection, UP } from './domIOSystem'
import { tupleComparator } from './comparators'

export type NumberTuple = [number, number]
export type Overscan = number | { main: number; reverse: number }
export const TOP = 'top' as const
export const BOTTOM = 'bottom' as const
export const NONE = 'none' as const
export type ListEnd = typeof TOP | typeof BOTTOM
export type ChangeDirection = typeof UP | typeof DOWN | typeof NONE

export const getOverscan = (overscan: Overscan, end: ListEnd, direction: ScrollDirection) => {
  if (typeof overscan === 'number') {
    return (direction === UP && end === TOP) || (direction === DOWN && end === BOTTOM) ? overscan : 0
  } else {
    if (direction === UP) {
      return end === TOP ? overscan.main : overscan.reverse
    } else {
      return end === BOTTOM ? overscan.main : overscan.reverse
    }
  }
}

export const sizeRangeSystem = u.system(
  ([{ scrollTop, viewportSize, deviation, headerHeight, scrollHorizontally }]) => {
    const listBoundary = u.stream<NumberTuple>()
    const topListSize = u.statefulStream(0)
    const overscan = u.statefulStream<Overscan>(0)

    const visibleRange = (u.statefulStreamFromEmitter(
      u.pipe(
        u.combineLatest(
          u.duc(scrollTop),
          u.duc(viewportSize),
          u.duc(headerHeight),
          u.duc(listBoundary, tupleComparator),
          u.duc(overscan),
          u.duc(topListSize),
          u.duc(deviation),
          scrollHorizontally
        ),
        u.map(([scrollTop, viewportSize, headerHeight, [listTop, listBottom], overscan, topListSize, deviation]) => {
          const top = scrollTop - headerHeight - deviation
          let direction: ChangeDirection = NONE

          listTop -= deviation
          listBottom -= deviation

          if (listTop > scrollTop + topListSize) {
            direction = UP
          }

          if (listBottom < scrollTop + viewportSize) {
            direction = DOWN
          }

          if (direction !== NONE) {
            return [
              Math.max(top - getOverscan(overscan, TOP, direction), 0),
              top + viewportSize + getOverscan(overscan, BOTTOM, direction),
            ] as NumberTuple
          }

          return null
        }),
        u.filter(value => value != null),
        u.distinctUntilChanged(tupleComparator as any)
      ),
      [0, 0]
    ) as unknown) as u.StatefulStream<NumberTuple>

    return {
      // input
      listBoundary,
      overscan,
      topListSize,

      // output
      visibleRange,
    }
  },
  u.tup(domIOSystem),
  { singleton: true }
)
