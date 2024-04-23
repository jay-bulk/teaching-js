import { app } from './app.js'

async function run () {
  const fastify = await app()

  await fastify.listen({
    host: '0.0.0.0',
    port: 8080
  })
}

run()
  .then((r) => { })
  .catch((err) => console.error(err))
