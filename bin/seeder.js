#!/usr/bin/env node

var path = require('path')
var seeder = require('mongoose-seed')
var env = process.env.NODE_ENV || 'development'
var config = (env === 'development') ? require('babel-register') && require('../src/config') : require('../dist/config')
var modelsPath = (env === 'development') ? path.join(config.root, 'src/models') : path.join(config.root, 'dist/models')

var data = [
  {
    model: 'OAuthClient',
    documents: [
      {
        'name': 'test client',
        'redirectURIs': ['http://localhost/callback']
      }
    ]
  },
  {
    model: 'OAuthUser',
    documents: [
      {
        'username': 'test',
        'password': '123qwe',
        'email': 'test@example.com',
        'profile': {
          'firstName': 'Test',
          'lastName': 'Client'
        }
      }
    ]
  }
]

seeder.connect(config.mongoDB.uri, function () {
  seeder.loadModels([
    path.join(modelsPath, 'oauth_client.js'),
    path.join(modelsPath, 'oauth_user.js')
  ])

  seeder.clearModels(['OAuthClient', 'OAuthUser'], function () {
    seeder.populateModels(data, function () {
      process.exit(0)
    })
  })
})
