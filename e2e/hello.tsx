import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Virtuoso } from '../src/'

const App = () => {
  return (
    <Virtuoso
      computeItemKey={key => `item-${key}`}
      // initialItemCount={30}
      totalCount={100}
      itemContent={index => <div style={{ width: 100, height: 100 }}>Item {index}</div>}
      style={{ height: 400, width: 400 }}
      scrollHorizontally={true}
      // fixedItemHeight={100}
      // components={{
      //   Scroller: React.forwardRef(({ style, children }: { style: React.CSSProperties; children: React.ReactNode }, ref) => {
      //     return (
      //       <div
      //         tabIndex={0}
      //         ref={ref}
      //         style={{
      //           ...style,
      //           height: 600,
      //           width: 600,
      //         }}
      //       >
      //         {children}
      //       </div>
      //     )
      //   }),
      // }}
    />
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
