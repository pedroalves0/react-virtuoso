import * as u from '@virtuoso.dev/urx'
import { totalListHeightSystem } from './totalListHeightSystem'
import { domIOSystem } from './domIOSystem'

export const alignToBottomSystem = u.system(
  ([{ viewportSize }, { totalListHeight }]) => {
    const alignToBottom = u.statefulStream(false)

    const paddingTopAddition = u.statefulStreamFromEmitter(
      u.pipe(
        u.combineLatest(alignToBottom, viewportSize, totalListHeight),
        u.filter(([enabled]) => enabled),
        u.map(([, viewportSize, totalListHeight]) => {
          return Math.max(0, viewportSize - totalListHeight)
        }),
        u.distinctUntilChanged()
      ),
      0
    )

    return { alignToBottom, paddingTopAddition }
  },
  u.tup(domIOSystem, totalListHeightSystem),
  { singleton: true }
)
