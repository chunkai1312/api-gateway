import React from 'react'
import { Router, Route, IndexRoute, Redirect, browserHistory } from 'react-router'
import Html from './components/Html'
import Layout from './components/Layout'
import Login from './components/Login'
import Signup from './components/Signup'
import NotFount from './components/NotFount'
import PasswordForgot from './components/PasswordForgot'
import PasswordReset from './components/PasswordReset'


// import ListPage from './views/list.jsx'
// import DetailPage from './views/detail.jsx'
// import Error404 from './views/404.jsx'

export default (
  <Router history={browserHistory}>
    <Route component={Html}>
      <Route path="/" component={Layout}>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/password/forgot" component={PasswordForgot} />
        <Route path="/password/reset/:token" component={PasswordReset} />
        <Route path="*" component={NotFount} />
      </Route>
    </Route>
  </Router>
)
