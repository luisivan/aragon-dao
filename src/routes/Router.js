import React from 'react'
import { Route, Switch } from 'react-router-dom'

// import VotingApp from '../voting/App'
import ANDelayRouter from '../an-delay/routes/Router'
import VotingRouter from '../voting/routes/Router'
import TokenWrapperRouter from '../token-wrapper/routes/Router'

function Router() {
  return (
    <Switch>
      {/* <Route exact path="/" component={VotingRouter} /> */}
      <Route exact path="/" component={ANDelayRouter} />
      <Route path="/votes" component={VotingRouter} />
      <Route path="/wrapper" component={TokenWrapperRouter} />
    </Switch>
  )
}

export default Router
