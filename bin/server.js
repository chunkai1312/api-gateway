#!/usr/bin/env node

require('dotenv').config()

var env = process.env.NODE_ENV || 'development'
var host = process.env.HOST || '0.0.0.0'
var port = process.env.PORT || 8080

var app = (env === 'development')
  ? require('babel-register') && require('../src/app')
  : require('../dist/app')

app.listen(port, host, function () {
  console.log('Listening on %s:%s, in %s mode', host, port, env)
})
