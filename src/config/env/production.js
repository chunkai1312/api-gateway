export default {
  mongoDB: {
    uri: 'mongodb://localhost:27017/shields',
    options: {
      server: { socketOptions: { keepAlive: 1 } }
    }
  },
  redis: {
    port: 6379,
    host: 'localhost'
  }
}
