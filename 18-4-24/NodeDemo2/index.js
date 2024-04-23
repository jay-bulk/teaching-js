import server from './app.js'
 
const run = async () => {
    try {
      await server.listen({ port: 1343 })
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }
  run()