import React from 'react'
import { Router, Route, browserHistory } from 'react-router'
import Html from './components/Html'
import Layout from './components/Layout'
import Login from './components/Login'
import Signup from './components/Signup'
import NotFount from './components/NotFount'
import PasswordForgot from './components/PasswordForgot'
import PasswordReset from './components/PasswordReset'
import Authorize from './components/Authorize'

export default (
  <Router history={browserHistory}>
    <Route component={Html}>
      <Route path="/" component={Layout}>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/oauth2/authorize" component={Authorize} />
        <Route path="/password/forgot" component={PasswordForgot} />
        <Route path="/password/reset/:token" component={PasswordReset} />
        <Route path="*" component={NotFount} />
      </Route>
    </Route>
  </Router>
)
