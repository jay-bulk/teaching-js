
async function route(fastify, opts) {
  fastify.get('/categories', async (request, reply) => {
    return { hello: 'world' }
  })
}

export default route
