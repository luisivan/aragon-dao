import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import VotingApp from '../App'
import VoteSingle from '../components/VoteSingle'
import { VotingProvider } from '../providers/VotingProvider'
import { VoterProvider } from '../providers/VoterProvider'

function VotingRouter() {
  return (
    <Switch>
      <Redirect exact path="/voting" to={'/voting/votes'} />
      <Route exact path="*/voting/votes/:id" component={VoteSingle} />
      <Route exact path="*/" component={VotingApp} />
    </Switch>
  )
}

export default () => (
  <VotingProvider>
    <VoterProvider>
      <VotingRouter />
    </VoterProvider>
  </VotingProvider>
)