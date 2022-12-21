import React from 'react'
import { Connect } from '@1hive/connect-react'

function ConnectProvider({ children }) {
  return (
    <Connect
      location={'artest4.aragonid.eth'} // {'0xa30c833cb5da03259c7dfbe6a3d0281d9f3b9ea4'} // {'taotest.aragonid.eth'} // {'0xa30c833cb5da03259c7dfbe6a3d0281d9f3b9ea4'} // {'taotest.aragonid.eth'} // for testing purpose.
      connector="thegraph"
      options={{
        network: 100,
      }}
    >
      {children}
    </Connect>
  )
}

export { ConnectProvider }
